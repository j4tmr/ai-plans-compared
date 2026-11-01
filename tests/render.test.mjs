import test from "node:test";
import assert from "node:assert/strict";

import { renderIndex, renderSitemap } from "../scripts/lib/render.mjs";

const document = {
  schema_version: 1,
  updated_at: "2026-11-01T00:00:00.000Z",
  checked_at: "2026-11-01T00:00:00.000Z",
  focus_model: {
    version: "DeepSeek-V4.1-Flash-1017",
    pricing: {
      input_cache_miss: { off_peak: 0.15, peak: 0.3 },
      output: { off_peak: 0.6, peak: 1.2 }
    }
  },
  recommendations: {
    lowest_monthly_price: { plan_id: "commandcode_go" },
    lowest_estimated_unit_cost: { plan_id: "workbuddy_flagship" },
    free_trial: { plan_id: "workbuddy_trial" },
    api_baseline: { balanced_off_peak_usd_per_1m_tokens: 0.375 }
  },
  sources: [
    {
      id: "deepseek",
      name: "DeepSeek API 官方定价",
      url: "https://example.com/deepseek",
      status: "ok",
      fetched_at: "2026-11-01T00:00:00.000Z"
    }
  ],
  plans: [
    {
      id: "commandcode_go",
      vendor: "Command Code",
      name: "Go",
      kind: "subscription",
      tags: [],
      currency: "USD",
      price: 1,
      price_period: "month",
      billing_option: "monthly",
      per: "account",
      included_usage: null,
      model_usage: { kind: "currency", amount: 10, currency: "USD", window: "month" },
      usage_value_multiplier: 10,
      estimated_tokens_millions: 26.67,
      price_per_1m_tokens: 0.0375,
      price_per_1m_tokens_cny: 0.266,
      confidence: "medium",
      available: true,
      notes: " boosted credits ",
      stale: false,
      rank_by_monthly_price: 1,
      rank_by_estimated_cost: 2
    },
    {
      id: "deepseek_official_api",
      vendor: "DeepSeek",
      name: "官方 API 按量计费",
      kind: "api_baseline",
      tags: ["official"],
      currency: "USD",
      price: null,
      price_period: "month",
      billing_option: null,
      per: "account",
      included_usage: null,
      model_usage: null,
      confidence: "official",
      available: true,
      notes: null,
      stale: false,
      rank_by_monthly_price: null,
      rank_by_estimated_cost: null
    }
  ]
};

const config = {
  name: "AI Plans Compared",
  locale: "zh-CN",
  repository: "j4tmr/ai-plans-compared"
};

test("renders the Chinese page with bilingual SEO and sponsored links", () => {
  const html = renderIndex({ document, config, origin: "https://example.com" });
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/example\.com\/">/);
  assert.match(html, /<link rel="alternate" hreflang="zh-CN" href="https:\/\/example\.com\/">/);
  assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/example\.com\/en\/">/);
  assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/example\.com\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/example\.com\/">/);
  assert.match(html, /<a class="brand" href="\.\/"/);
  assert.match(html, /hreflang="zh-CN">AI 套餐对比<\/a>/);
  assert.match(html, /最便宜的 DeepSeek 套餐/);
  assert.match(html, /（2026年11月更新）/);
  assert.match(html, /每日自动核对官方价/);
  assert.match(html, /结论：同样约 70 元/);
  assert.match(html, /Command Code GOAT/);
  assert.match(html, /约 33 亿/);
  assert.match(html, /5 小时/);
  assert.match(html, /three-plans-70-yuan-deepseek-tokens-20261030/);
  assert.match(html, /FAQPage/);
  assert.match(html, /70 元 DeepSeek Flash 套餐 token 对比/);
  assert.match(html, /href="https:\/\/lmvpn\.4tmr\.com\/"/);
  assert.match(html, /lmvpn-banner\.svg/);
  assert.match(html, /lmvpn-banner-mobile\.svg/);
  assert.doesNotMatch(html, /lmvpn-banner\.gif/);
  assert.match(html, /www\.workbuddy\.cn\/events\/invite\?inviteCode=[A-Za-z0-9_-]{4,64}/);
  assert.match(html, /88api\.ai\/sign-up\?aff=dlVM/);
  assert.match(html, /88api-banner\.svg/);
  assert.match(html, /88api-banner-mobile\.svg/);
  assert.match(html, /Claude 中转站/);
  assert.match(html, /WorkBuddy 邀请注册（推广链接）/);
  assert.match(html, /邀请注册领 2000 积分/);
  assert.match(html, /rel="nofollow sponsored noopener"/);
  assert.match(html, /social\.png/);
  assert.match(html, /og:image:width" content="1200"/);
  assert.match(html, /"dateModified":"2026-11-01"/);
  assert.match(html, /"keywords":\["最便宜的 DeepSeek 套餐"/);
});

test("renders a full English page with hreflang and localized promos", () => {
  const html = renderIndex({ document, config, origin: "https://example.com", locale: "en" });
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/example\.com\/en\/">/);
  assert.match(html, /AI Plans Compared/);
  assert.match(html, /Cheapest DeepSeek Plan\? \$10 DeepSeek Flash Token Limits Compared/);
  assert.match(html, /\(Nov 2026\)/);
  assert.match(html, /What is the cheapest DeepSeek plan/);
  assert.match(html, /Bottom line: at about \$10\/month/);
  assert.match(html, /≈3\.3B/);
  assert.match(html, /WorkBuddy invite registration \(sponsored link\)/);
  assert.match(html, /Get 2,000 credits with this invite/);
  assert.match(html, /88api\.ai\/sign-up\?aff=dlVM/);
  assert.match(html, /88API Claude API relay/);
  assert.match(html, /href="\.\.\/styles\.css"/);
  assert.match(html, /href="\.\.\/" hreflang="zh-CN" lang="zh-CN">中文/);
  assert.match(html, /"inLanguage":"en"/);
  assert.match(html, /og:locale" content="en_US"/);
});

test("sitemap includes both languages with xhtml alternates", () => {
  const sitemap = renderSitemap("https://example.com", "2026-11-01");
  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(sitemap, /<loc>https:\/\/example\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/example\.com\/en\/<\/loc>/);
  assert.match(sitemap, /hreflang="zh-CN" href="https:\/\/example\.com\/"/);
  assert.match(sitemap, /hreflang="en" href="https:\/\/example\.com\/en\/"/);
});
