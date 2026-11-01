import test from "node:test";
import assert from "node:assert/strict";

import { parseDeepSeek } from "../scripts/lib/sources/deepseek.mjs";
import { parseWorkBuddy } from "../scripts/lib/sources/workbuddy.mjs";
import { parseOpenCode } from "../scripts/lib/sources/opencode.mjs";
import { parseCommandCode } from "../scripts/lib/sources/commandcode.mjs";

const deepseekHtml = `
  <html><body>
    <table>
      <tr><th>MODEL</th><th>deepseek-flash</th></tr>
      <tr><td>MODEL VERSION</td><td>DeepSeek-V4.1-Flash-1017</td></tr>
      <tr><td>CONTEXT LENGTH</td><td>1M</td></tr>
      <tr><td>MAX OUTPUT</td><td>MAXIMUM: 384K</td></tr>
      <tr><td>1M INPUT TOKENS(CACHE MISS)</td><td>OFF-PEAK</td><td>$0.15</td><td>PEAK</td><td>$0.30</td></tr>
      <tr><td>1M OUTPUT TOKENS</td><td>OFF-PEAK</td><td>$0.60</td><td>PEAK</td><td>$1.20</td></tr>
    </table>
    Peak hours are 01:00 - 04:00 and 06:00 - 10:00 UTC
  </body></html>
`;

test("parses official DeepSeek Flash prices", () => {
  const model = parseDeepSeek(deepseekHtml).model;
  assert.equal(model.official_api_name, "deepseek-flash");
  assert.equal(model.version, "DeepSeek-V4.1-Flash-1017");
  assert.equal(model.pricing.input_cache_miss.off_peak, 0.15);
  assert.equal(model.pricing.output.peak, 1.2);
  assert.equal(model.context_window_tokens, 1_000_000);
});

const workbuddyHtml = `
  <html><body><table>
    <tr><th>版本</th><th>体验版</th><th>标准版</th><th>高级版</th><th>旗舰版</th></tr>
    <tr><td>月付</td><td>免费</td><td>99 元/月</td><td>199 元/月</td><td>999 元/月</td></tr>
    <tr><td>连续包月（7 折）</td><td>—</td><td>70 元/月</td><td>140 元/月</td><td>700 元/月</td></tr>
    <tr><td>连续包年（5.6折）</td><td>—</td><td>672 元/年</td><td>1,344 元/年</td><td>6,720 元/年</td></tr>
    <tr><td>基础积分 / 月</td><td>500</td><td>2,000</td><td>4,000</td><td>20,000</td></tr>
    <tr><td>加赠积分 / 月（限时）</td><td>—</td><td>2,000</td><td>5,000</td><td>30,000</td></tr>
    <tr><td>每月实得积分（限时）</td><td>500</td><td>4,000</td><td>9,000</td><td>50,000</td></tr>
  </table></body></html>
`;

test("parses WorkBuddy free and continuous-month prices", () => {
  const { plans } = parseWorkBuddy(workbuddyHtml, "2026-11-01");
  assert.equal(plans.length, 4);
  assert.equal(plans[0].price, 0);
  assert.equal(plans[1].price, 70);
  assert.equal(plans[1].list_price, 99);
  assert.equal(plans[1].included_usage.amount, 4000);
  assert.equal(plans[3].price, 700);
});

const opencodeHtml = `
  <html><body>
    <p>Each model has the following usage limits: 5-hour — 20% of the monthly limit; weekly — 50%; and monthly — 100%.</p>
    <table><tr><th>Plan</th><th>Price</th><th>Included usage</th></tr>
      <tr><td>Go</td><td>$10/month</td><td>Lower-cost access</td></tr>
    </table>
    <div data-plan-panel="go"><table>
      <tr><th>Model</th><th>Input</th><th>Output</th><th>Monthly limit</th></tr>
      <tr><td>DeepSeek V4.1 Flash (Off-Peak)</td><td>$0.15</td><td>$0.60</td><td>$100</td></tr>
    </table></div>
  </body></html>
`;

test("parses OpenCode DeepSeek Flash monthly limit", () => {
  const { plans } = parseOpenCode(opencodeHtml, "2026-11-01");
  assert.equal(plans.length, 1);
  assert.equal(plans[0].price, 10);
  assert.equal(plans[0].model_usage.amount, 100);
  assert.deepEqual(plans[0].usage_windows, {
    five_hour: { kind: "pct_of_monthly", value: 20 },
    weekly: { kind: "pct_of_monthly", value: 50 }
  });
});

test("OpenCode usage windows fail open when the sentence is missing", () => {
  const withoutWindows = opencodeHtml.replace(/<p>Each model[\s\S]*?<\/p>/, "");
  const { plans } = parseOpenCode(withoutWindows, "2026-11-01");
  assert.equal(plans[0].usage_windows, null);
});

const commandcodeHtml = `
  <html><body>
    DeepSeek V4.1 Flash
    <table><tr><th>Plan</th><th>Price/mo</th><th>Credits/mo</th><th>Included LLM Usage</th><th>Models</th></tr>
      <tr><td>Go</td><td>$1</td><td>$10</td><td>~9K requests</td><td>Open models</td></tr>
    </table>
    <table><tr><th>Plan</th><th>Boosted usage</th></tr><tr><td>Go</td><td>$10</td></tr></table>
  </body></html>
`;

test("parses Command Code Go boosted credits", () => {
  const { plans } = parseCommandCode(commandcodeHtml, "2026-11-01");
  assert.equal(plans.length, 1);
  assert.equal(plans[0].price, 1);
  assert.equal(plans[0].model_usage.amount, 10);
  assert.equal(plans[0].available, true);
});
