import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { fetchText } from "./lib/fetch-source.mjs";
import { fetchUsdCny } from "./lib/fx.mjs";
import { normalizePlan } from "./lib/plans.mjs";
import { SOURCE as deepseekSource, parseDeepSeek } from "./lib/sources/deepseek.mjs";
import { SOURCE as workbuddySource, parseWorkBuddy } from "./lib/sources/workbuddy.mjs";
import { SOURCE as opencodeSource, parseOpenCode } from "./lib/sources/opencode.mjs";
import { SOURCE as commandcodeSource, parseCommandCode } from "./lib/sources/commandcode.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "data/plans.seed.json");
const outputPath = path.join(root, "data/pricing.json");
const readmePath = path.join(root, "README.md");

const sourceConfigs = [
  { source: deepseekSource, parse: (html, checkedAt) => parseDeepSeek(html, checkedAt), fixture: "deepseek.html" },
  { source: workbuddySource, parse: parseWorkBuddy, fixture: "workbuddy.html" },
  { source: opencodeSource, parse: parseOpenCode, fixture: "opencode.html" },
  { source: commandcodeSource, parse: parseCommandCode, fixture: "commandcode.html" }
];

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--fixture-dir") {
      args.set("fixtureDir", argv[index + 1]);
      index += 1;
    }
  }
  return args;
}

function shanghaiDate(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function signature(plans) {
  return JSON.stringify(
    plans.map((plan) => ({ ...plan, verified_at: undefined, stale: undefined })),
    Object.keys(plans[0] ?? {}).sort()
  );
}

function rankPlans(plans) {
  const paidPlans = plans
    .filter((plan) => plan.available && plan.price > 0 && plan.kind === "subscription")
    .filter((plan) => plan.model_usage?.amount > 0 || plan.method === "credit_assumption");
  const estimatedPlans = paidPlans.filter((plan) => plan.price_per_1m_tokens_cny != null);
  const monthlyRank = new Map();
  [...new Set(paidPlans.map((plan) => plan.monthly_price_cny ?? Number.POSITIVE_INFINITY))]
    .sort((a, b) => a - b)
    .forEach((value, index) => {
      for (const plan of paidPlans.filter((item) => (item.monthly_price_cny ?? Number.POSITIVE_INFINITY) === value)) {
        monthlyRank.set(plan.id, index + 1);
      }
    });
  const estimatedRank = new Map();
  [...new Set(estimatedPlans.map((plan) => plan.price_per_1m_tokens_cny))]
    .sort((a, b) => a - b)
    .forEach((value, index) => {
      for (const plan of estimatedPlans.filter((item) => item.price_per_1m_tokens_cny === value)) {
        estimatedRank.set(plan.id, index + 1);
      }
    });

  return plans.map((plan) => ({
    ...plan,
    rank_by_monthly_price: monthlyRank.get(plan.id) ?? null,
    rank_by_estimated_cost: estimatedRank.get(plan.id) ?? null
  }));
}

function buildRecommendations(plans, officialModel) {
  const paidPlans = plans.filter((plan) => plan.available && plan.price > 0 && plan.kind === "subscription");
  const withMonthly = paidPlans.filter((plan) => plan.monthly_price_cny != null);
  const withEstimate = paidPlans.filter((plan) => plan.price_per_1m_tokens_cny != null);
  const lowestMonthly = [...withMonthly].sort((a, b) => a.monthly_price_cny - b.monthly_price_cny)[0] ?? null;
  const lowestEstimated = [...withEstimate].sort((a, b) => a.price_per_1m_tokens_cny - b.price_per_1m_tokens_cny)[0] ?? null;
  const freeTrial = plans.find((plan) => plan.price === 0 && plan.available) ?? null;

  return {
    lowest_monthly_price: lowestMonthly && { plan_id: lowestMonthly.id, reason: "已收录的付费订阅中，折算 CNY 后月费最低。" },
    lowest_estimated_unit_cost: lowestEstimated && { plan_id: lowestEstimated.id, reason: "按官方页/公开假设折算后，每百万 token 的估算成本最低。" },
    free_trial: freeTrial && { plan_id: freeTrial.id, reason: "当前公开的免费体验档；额度与有效期以官方页为准。" },
    api_baseline: {
      plan_id: "deepseek_official_api",
      balanced_off_peak_usd_per_1m_tokens: (officialModel.pricing.input_cache_miss.off_peak + officialModel.pricing.output.off_peak) / 2
    }
  };
}

function renderReadmeTable(document) {
  const rows = document.plans
    .filter((plan) => plan.available && plan.price != null)
    .sort((a, b) => (a.rank_by_estimated_cost ?? 999) - (b.rank_by_estimated_cost ?? 999))
    .map(
      (plan) =>
        `| ${plan.rank_by_estimated_cost ?? "—"} | ${plan.vendor} ${plan.name} | ${plan.currency === "CNY" ? "¥" : "$"}${plan.price} | ${plan.estimated_tokens_millions ?? "—"}M | ${plan.price_per_1m_tokens_cny ?? "—"} | ${plan.confidence ?? "—"} |`
    );
  return [
    "| # | 平台 / 套餐 | 月费 | 估算额度 | 估算 ¥/1M tokens | 置信度 |",
    "| ---: | --- | ---: | ---: | ---: | --- |",
    ...rows
  ].join("\n");
}

async function updateReadme(document) {
  const original = await readFile(readmePath, "utf8");
  const start = "<!-- pricing:start -->";
  const end = "<!-- pricing:end -->";
  if (!original.includes(start) || !original.includes(end)) return;
  const next = original.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${renderReadmeTable(document)}\n${end}`);
  if (next !== original) await writeFile(readmePath, next);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const checkedAt = now.toISOString();
  const verifiedAt = shanghaiDate(now);
  const seed = JSON.parse(await readFile(seedPath, "utf8"));
  let previous = null;
  try {
    previous = JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    previous = null;
  }

  const sourceResults = [];
  const rawPlans = [];
  let officialModel = previous?.focus_model ?? null;

  for (const config of sourceConfigs) {
    const startedAt = new Date().toISOString();
    try {
      const html = args.has("fixtureDir")
        ? await readFile(path.join(args.get("fixtureDir"), config.fixture), "utf8")
        : await fetchText(config.source.url);
      const parsed = config.parse(html, verifiedAt);
      if (config.source.id === "deepseek") {
        officialModel = parsed.model;
      } else {
        rawPlans.push(...parsed.plans);
      }
      sourceResults.push({
        ...config.source,
        status: "ok",
        fetched_at: startedAt,
        plans_count: config.source.id === "deepseek" ? 0 : parsed.plans.length
      });
    } catch (error) {
      sourceResults.push({
        ...config.source,
        status: "error",
        fetched_at: startedAt,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (!officialModel) throw new Error("No DeepSeek official model pricing is available");
  const failedSourceIds = new Set(sourceResults.filter((result) => result.status === "error").map((result) => result.id));
  const carriedPlans = (previous?.plans ?? []).filter((plan) => failedSourceIds.has(plan.source_id));

  let fx = previous?.fx ?? null;
  if (!args.has("fixtureDir")) {
    try {
      fx = await fetchUsdCny();
    } catch (error) {
      sourceResults.push({
        id: "fx",
        vendor: "Exchange rate",
        name: "USD/CNY",
        url: "https://api.frankfurter.app/latest?from=USD&to=CNY",
        status: "error",
        fetched_at: checkedAt,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const normalizedPlans = [];
  for (const rawPlan of rawPlans) {
    const normalized = normalizePlan(rawPlan, seed, officialModel, { checkedAt, verifiedAt, fx });
    if (normalized) normalizedPlans.push(normalized);
  }
  for (const plan of carriedPlans) {
    normalizedPlans.push({ ...plan, stale: true, verified_at: plan.verified_at });
  }

  const officialSeedPlan = seed.plans.find((plan) => plan.id === "deepseek_official_api");
  const officialPlan = normalizePlan(
    {
      id: officialSeedPlan.id,
      vendor: "DeepSeek",
      vendor_id: "deepseek",
      name: "官方 API 按量计费",
      currency: officialModel.currency,
      price: null,
      price_period: "month",
      method: "official_api",
      available: true,
      verified_at: verifiedAt,
      source_url: deepseekSource.url,
      included_usage: { kind: "none", amount: null, currency: null, window: null, note: "官方无订阅套餐" },
      model_usage: null
    },
    seed,
    officialModel,
    { checkedAt, verifiedAt, fx }
  );
  normalizedPlans.push(officialPlan);

  const rankedPlans = rankPlans(normalizedPlans);
  const dataChanged = !previous || signature(previous.plans ?? []) !== signature(rankedPlans);
  const document = {
    schema_version: 1,
    project: "cheapest-deepseek-plan",
    updated_at: dataChanged ? checkedAt : previous.updated_at,
    checked_at: checkedAt,
    focus_model: officialModel,
    fx,
    methodology_version: seed.methodology_version,
    assumptions: seed.assumptions,
    sources: sourceResults,
    recommendations: buildRecommendations(rankedPlans, officialModel),
    plans: rankedPlans
  };

  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await updateReadme(document);
}

await main();
