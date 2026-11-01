// 「大概 token」和「撞墙点」来自《70 元 DeepSeek 三套餐对比》原文的实测结论
// （2026-10-14 至 10-30），不随每日抓取变化；月费与官方额度取自 pricing.json。
const focusRows = {
  opencode_go: {
    name: "OpenCode Go",
    tokens: "约 33 亿（含缓存）",
    wall: "5 小时最多用当月额度 20%，每周最多 50%"
  },
  commandcode_goat: {
    name: "Command Code GOAT",
    tokens: "约 31 亿（含缓存）",
    wall: "5 小时 $20，每周 $50"
  },
  "workbuddy-standard": {
    name: "WorkBuddy 标准版",
    tokens: "约 24 亿（含缓存）",
    wall: "积分用完为止"
  }
};

export function renderReadmeTable(document) {
  const plans = new Map((document?.plans ?? []).map((plan) => [plan.id, plan]));
  const rows = Object.entries(focusRows).map(([id, focus]) => {
    const plan = plans.get(id);
    if (!plan || plan.price == null) throw new Error(`README table: plan ${id} is missing`);
    const symbol = plan.currency === "CNY" ? "¥" : "$";
    const usage = plan.model_usage;
    const credits = plan.included_usage;
    const quota =
      usage?.kind === "currency" && usage.currency === "USD" && usage.amount > 0
        ? `Flash 每月 $${usage.amount}`
        : credits?.kind === "credits" && credits.amount > 0
          ? `${credits.amount} 积分 / 月`
          : "见官方页";
    return `| ${focus.name} | ${symbol}${plan.price} | ${quota} | ${focus.tokens} | ${focus.wall} |`;
  });
  return [
    "| 套餐 | 月费 | 官方额度 | 大概 token | 撞墙点 |",
    "| --- | ---: | --- | ---: | --- |",
    ...rows
  ].join("\n");
}
