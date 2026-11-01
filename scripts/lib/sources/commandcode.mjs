import { loadHtml, findTable, tableRows, compact } from "../html.mjs";
import { toNumber } from "../number.mjs";

export const SOURCE = {
  id: "commandcode",
  vendor: "Command Code",
  name: "Command Code Pricing & Limits",
  url: "https://commandcode.ai/docs/resources/pricing-limits"
};

const nameMap = {
  "Go": "go",
  "GOAT": "goat",
  "Pro": "pro",
  "Provider": "provider",
  "Max 10×": "max_10",
  "Max 20×": "max_20",
  "Team Pro": "team_pro"
};

function rowsByPlan(rows) {
  return new Map(rows.slice(1).map((row) => [row[0], row]));
}

export function parseCommandCode(html, checkedAt) {
  const $ = loadHtml(html);
  const individualTable = findTable(
    $,
    (rows) =>
      rows[0]?.[0] === "Plan" &&
      rows[0]?.[1] === "Price/mo" &&
      rows[0]?.[2] === "Credits/mo" &&
      rows[0]?.some((cell) => cell.includes("Included LLM Usage"))
  );
  if (!individualTable) throw new Error("Command Code individual plan table was not found");

  const individualRows = rowsByPlan(tableRows($, individualTable));
  const teamTable = findTable(
    $,
    (rows) => rows.some((row) => row[0] === "Team Pro")
  );
  const teamRows = rowsByPlan(teamTable ? tableRows($, teamTable) : []);
  const usageTable = findTable(
    $,
    (rows) => rows[0]?.[0] === "Plan" && rows[0]?.[1] === "Your cost" && rows[0]?.some((cell) => cell.includes("Monthly credits"))
  );
  const usageRows = rowsByPlan(usageTable ? tableRows($, usageTable) : []);
  const boostedTable = findTable(
    $,
    (rows) => rows[0]?.[0] === "Plan" && rows[0]?.[1] === "Boosted usage"
  );
  const boostedRows = rowsByPlan(boostedTable ? tableRows($, boostedTable) : []);
  if (!compact($("body").text()).includes("DeepSeek V4.1 Flash")) {
    throw new Error("DeepSeek V4.1 Flash is no longer listed on the Command Code pricing page");
  }

  const names = [...new Set([...individualRows.keys(), ...teamRows.keys()])].filter((name) => Object.hasOwn(nameMap, name));
  if (!names.length) throw new Error("Command Code plan names changed");

  const plans = names.map((name) => {
    const row = individualRows.get(name) ?? teamRows.get(name);
    const usageRow = usageRows.get(name);
    const boostedRow = boostedRows.get(name);
    const generalCredits = toNumber(usageRow?.[2] ?? row[2] ?? "");
    const boostedCredits = toNumber(boostedRow?.[1] ?? "");
    const modelCredits = boostedCredits ?? generalCredits;
    if (row[1] == null) {
      throw new Error(`Command Code ${name} price is missing`);
    }

    return {
      id: `commandcode_${nameMap[name]}`,
      vendor: SOURCE.vendor,
      vendor_id: SOURCE.id,
      name,
      currency: "USD",
      price: toNumber(row[1]),
      price_period: "month",
      billing_option: "monthly",
      per: "account",
      included_usage: generalCredits == null
        ? { kind: "none", amount: null, currency: null, window: null, note: row[2] || row[3] || "Pay as you go" }
        : {
            kind: "currency",
            amount: generalCredits,
            currency: "USD",
            window: "month",
            note: row[3] || "Monthly usage credits"
          },
      model_usage:
        modelCredits == null
          ? null
          : {
              kind: "currency",
              amount: modelCredits,
              currency: "USD",
              window: "month",
              note: boostedCredits != null ? "DeepSeek V4.1 Flash boosted monthly credits" : "DeepSeek V4.1 Flash 每月额度"
            },
      method: modelCredits == null ? "none" : "included_value_to_tokens",
      available: name !== "Provider",
      verified_at: checkedAt,
      source_url: SOURCE.url
    };
  });

  return { url: SOURCE.url, plans };
}
