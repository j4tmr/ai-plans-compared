import { loadHtml, findTable, tableRows, compact } from "../html.mjs";
import { toNumber } from "../number.mjs";

export const SOURCE = {
  id: "workbuddy",
  vendor: "WorkBuddy",
  name: "WorkBuddy 定价详情",
  url: "https://www.workbuddy.cn/docs/workbuddy/Pricing"
};

const key = (value) => compact(value).toLowerCase().replace(/\s+/g, "");

function mappedRows(rows) {
  const map = new Map();
  for (const row of rows) {
    if (row.length > 1) map.set(key(row[0]), row.slice(1));
  }
  return map;
}

function rowValue(map, needle, index) {
  const row = [...map.entries()].find(([label]) => label.includes(key(needle)));
  return row?.[1]?.[index] ?? row?.[index] ?? null;
}

function planValue(map, needle, index, fallback = null) {
  const value = rowValue(map, needle, index);
  if (!value || value === "—" || value === "-") return fallback;
  return value;
}

function priceValue(map, needle, index) {
  const value = planValue(map, needle, index);
  if (value === "免费") return 0;
  return toNumber(value ?? "");
}

export function parseWorkBuddy(html, checkedAt) {
  const $ = loadHtml(html);
  const table = findTable(
    $,
    (rows) => rows.length > 5 && rows[0]?.[0] === "版本" && rows[0]?.some((cell) => cell.includes("标准版"))
  );
  if (!table) throw new Error("WorkBuddy pricing table was not found");

  const rows = tableRows($, table);
  const header = rows[0];
  const planNames = ["体验版", "标准版", "高级版", "旗舰版"];
  const columns = planNames.map((name) => header.findIndex((cell) => cell.includes(name)));
  if (columns.some((index) => index < 0)) throw new Error("WorkBuddy plan columns changed");
  const map = mappedRows(rows.slice(1));

  return {
    url: SOURCE.url,
    plans: planNames.map((name, index) => {
      const column = columns[index];
      const valueColumn = column - 1;
      const monthly = priceValue(map, "月付", valueColumn);
      const continuousMonthly = priceValue(map, "连续包月", valueColumn);
      const annual = priceValue(map, "连续包年", valueColumn);
      const baseCredits = toNumber(planValue(map, "基础积分", valueColumn) ?? "");
      const bonusCredits = toNumber(planValue(map, "加赠积分", valueColumn) ?? 0);
      const totalCredits =
        toNumber(planValue(map, "每月实得积分", valueColumn) ?? "") ?? (baseCredits ?? 0) + (bonusCredits ?? 0);
      const price = continuousMonthly ?? monthly;
      if (price == null) throw new Error(`WorkBuddy ${name} has no parsable monthly price`);

      return {
        id: `workbuddy-${name === "体验版" ? "trial" : name === "标准版" ? "standard" : name === "高级版" ? "pro" : "flagship"}`,
        vendor: SOURCE.vendor,
        vendor_id: SOURCE.id,
        name,
        currency: "CNY",
        price,
        price_period: "month",
        billing_option: continuousMonthly == null ? "monthly" : "continuous_month",
        list_price: monthly,
        annual_price: annual,
        included_usage: {
          kind: "credits",
          amount: totalCredits,
          currency: null,
          window: "month",
          base_amount: baseCredits,
          bonus_amount: bonusCredits,
          note: bonusCredits > 0 ? "基础积分加限时赠送积分" : "基础积分"
        },
        method: "credit_assumption",
        available: true,
        verified_at: checkedAt,
        source_url: SOURCE.url
      };
    })
  };
}
