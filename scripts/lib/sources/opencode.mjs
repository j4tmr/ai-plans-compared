import { loadHtml, findTable, tableRows } from "../html.mjs";
import { toNumber } from "../number.mjs";

export const SOURCE = {
  id: "opencode",
  vendor: "OpenCode",
  name: "OpenCode Go plan",
  url: "https://opencode.ai/v2/docs/console/go"
};

const planPanels = {
  "Go": "go",
  "Go Plus": "go-plus",
  "Go Teams": "go-teams"
};

function monthlyFlashLimit($, panel) {
  const table = $(`div[data-plan-panel="${panel}"] table`).first();
  if (!table.length) return null;
  const row = tableRows($, table).find((cells) => cells[0]?.startsWith("DeepSeek V4.1 Flash"));
  if (!row) return null;
  return toNumber(row.at(-1) ?? "");
}

// Usage-window percentages live in a prose sentence, e.g.
// "usage limits: 5-hour — 20% of the monthly limit; weekly — 50%; and monthly — 100%."
// Fail open: vendors rewording the sentence must not break the daily refresh.
function parseUsageWindows($) {
  const text = $("body").text().replace(/\s+/g, " ");
  const match = text.match(
    /5[-\s]hour\s*[—–-]\s*(\d{1,3})\s*%(?:\s*of\s+(?:the|your)\s+monthly\s+limit)?\s*[;；]\s*weekly\s*[—–-]\s*(\d{1,3})\s*%/i
  );
  if (!match) return null;
  return {
    five_hour: { kind: "pct_of_monthly", value: Number(match[1]) },
    weekly: { kind: "pct_of_monthly", value: Number(match[2]) }
  };
}

export function parseOpenCode(html, checkedAt) {
  const $ = loadHtml(html);
  const usageWindows = parseUsageWindows($);
  const table = findTable(
    $,
    (rows) => rows[0]?.[0] === "Plan" && rows[0]?.[1] === "Price" && rows[0]?.some((cell) => cell.includes("usage"))
  );
  if (!table) throw new Error("OpenCode plan table was not found");

  const rows = tableRows($, table).slice(1);
  const plans = rows
    .filter((row) => Object.hasOwn(planPanels, row[0]))
    .map((row) => {
      const name = row[0];
      const panel = planPanels[name];
      const limit = monthlyFlashLimit($, panel);
      if (limit == null) throw new Error(`OpenCode ${name} DeepSeek Flash monthly limit is missing`);
      return {
        id: `opencode_${panel.replace(/-/g, "_")}`,
        vendor: SOURCE.vendor,
        vendor_id: SOURCE.id,
        name,
        currency: "USD",
        price: toNumber(row[1]),
        price_period: "month",
        billing_option: "monthly",
        per: row[1].includes("/member/") ? "member" : "account",
        included_usage: {
          kind: "description",
          amount: null,
          currency: null,
          window: null,
          note: row[2]
        },
        model_usage: {
          kind: "currency",
          amount: limit,
          currency: "USD",
          window: "month",
          note: "DeepSeek V4.1 Flash 每月额度"
        },
        usage_windows: usageWindows,
        method: "included_value_to_tokens",
        available: true,
        verified_at: checkedAt,
        source_url: SOURCE.url
      };
    });

  if (!plans.length) throw new Error("OpenCode plan names changed");
  return { url: SOURCE.url, plans };
}
