import test from "node:test";
import assert from "node:assert/strict";

import { renderReadmeTable } from "../scripts/lib/readme-table.mjs";

const document = {
  plans: [
    {
      id: "opencode_go",
      price: 10,
      currency: "USD",
      model_usage: { kind: "currency", amount: 100, currency: "USD", window: "month" }
    },
    {
      id: "commandcode_goat",
      price: 10,
      currency: "USD",
      model_usage: { kind: "currency", amount: 100, currency: "USD", window: "month" }
    },
    {
      id: "workbuddy-standard",
      price: 70,
      currency: "CNY",
      included_usage: { kind: "credits", amount: 4000, window: "month" }
    }
  ]
};

test("renders the curated README table from pricing data", () => {
  const lines = renderReadmeTable(document).split("\n");
  assert.equal(lines.length, 5);
  assert.equal(lines[0], "| 套餐 | 月费 | 官方额度 | 大概 token | 撞墙点 |");
  assert.match(lines[2], /^\| OpenCode Go \| \$10 \| Flash 每月 \$100 \| 约 33 亿（含缓存） \| 5 小时最多用当月额度 20%，每周最多 50% \|$/);
  assert.match(lines[3], /^\| Command Code GOAT \| \$10 \| Flash 每月 \$100 \| 约 31 亿（含缓存） \| 5 小时 \$20，每周 \$50 \|$/);
  assert.match(lines[4], /^\| WorkBuddy 标准版 \| ¥70 \| 4000 积分 \/ 月 \| 约 24 亿（含缓存） \| 积分用完为止 \|$/);
});

test("throws when a focus plan is missing", () => {
  assert.throws(() => renderReadmeTable({ plans: [] }), /plan opencode_go is missing/);
});
