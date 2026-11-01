const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ARTICLE_URL = "https://www.4qin.com/p/three-plans-70-yuan-deepseek-tokens-20261030";
const LMVPN_URL = "https://lmvpn.4tmr.com/";
const API88_URL = "https://88api.ai/sign-up?aff=dlVM";
const WORKBUDDY_FALLBACK_URL = "https://www.workbuddy.cn/";

// 来自《70 元 DeepSeek 三套餐对比》原文的实测结论。
const focusPlans = {
  "zh-CN": [
    {
      name: "OpenCode Go",
      price: "$10 / 月",
      quota: "Flash 每月 $80 额度",
      tokens: "约 33 亿",
      tokensNote: "含缓存 token",
      limit: "5 小时最多用当月额度的 20%，每周最多 50%",
      wall: "短时间猛跑容易先撞 5 小时墙，重任务要等窗口恢复。",
      cache: "93.09%"
    },
    {
      name: "Command Code GOAT",
      price: "$10 / 月",
      quota: "Flash 每月 $80（采样期 $60）",
      tokens: "约 31 亿",
      tokensNote: "含缓存 token",
      limit: "5 小时 $20，每周 $50",
      wall: "周额度比月额度更早见底，高频使用更容易撞墙。",
      cache: "92.40%"
    },
    {
      name: "WorkBuddy 标准版",
      price: "¥70 / 月",
      quota: "4000 积分 / 月",
      tokens: "约 24 亿",
      tokensNote: "含缓存 token",
      limit: "积分用完为止；没有公开的 5 小时 / 周窗口",
      wall: "不撞时间墙，但积分扣完就没了。",
      cache: "96.36%",
      invite: true
    }
  ],
  en: [
    {
      name: "OpenCode Go",
      price: "$10 / mo",
      quota: "$80 of Flash usage per month",
      tokens: "≈3.3B",
      tokensNote: "including cached tokens",
      limit: "20% of the monthly quota per 5 hours; 50% per week",
      wall: "Heavy bursts hit the 5-hour wall first; wait for the window to reset.",
      cache: "93.09%"
    },
    {
      name: "Command Code GOAT",
      price: "$10 / mo",
      quota: "$80/month for Flash ($60 during sampling)",
      tokens: "≈3.1B",
      tokensNote: "including cached tokens",
      limit: "5-hour cap: $20; weekly cap: $50",
      wall: "The weekly cap runs out before the monthly cap under heavy use.",
      cache: "92.40%"
    },
    {
      name: "WorkBuddy Standard",
      price: "¥70 / mo",
      quota: "4,000 credits / month",
      tokens: "≈2.4B",
      tokensNote: "including cached tokens",
      limit: "Use until credits run out; no published 5-hour/weekly window",
      wall: "No time-window wall; the plan stops when credits are exhausted.",
      cache: "96.36%",
      invite: true
    }
  ]
};

const faqItems = {
  "zh-CN": [
    {
      q: "同样 70 元，哪家能跑的 DeepSeek Flash token 最多？",
      a: "按原文的实测缓存命中率估算：OpenCode Go 约 33 亿、Command Code GOAT 约 31 亿、WorkBuddy 标准版约 24 亿，都是含缓存 token。"
    },
    {
      q: "什么是撞墙？",
      a: "OpenCode 有 5 小时和每周限额，Command Code 有 5 小时 $20、每周 $50 的额度上限。短时间猛跑时，先卡住的是这些窗口额度，而不是月额度。WorkBuddy 则是积分扣完为止。"
    },
    {
      q: "这些 token 数是官方数字吗？",
      a: "不是。官方只给美元额度或积分，token 数是按作者 2026-10-14 至 10-30 的实测用量、缓存命中率和官方单价估算出来的。"
    }
  ],
  en: [
    {
      q: "Which plan gives the most DeepSeek Flash tokens for about $10?",
      a: "Based on the measured cache-hit rates in the source article: OpenCode Go is roughly 3.3B tokens, Command Code GOAT roughly 3.1B, and WorkBuddy Standard roughly 2.4B. All counts include cached tokens."
    },
    {
      q: "What does hitting the usage wall mean?",
      a: "OpenCode has 5-hour and weekly limits. Command Code caps usage at $20 per 5 hours and $50 per week. During heavy use these windows run out before the monthly quota. WorkBuddy simply stops when its credits are exhausted."
    },
    {
      q: "Are these token counts official?",
      a: "No. The providers publish dollar quotas or credits, not token counts. These estimates use the author's measured usage, cache-hit rates, and official DeepSeek prices from October 14-30, 2026."
    }
  ]
};

const copyByLocale = {
  "zh-CN": {
    lang: "zh-CN",
    assetBase: "",
    homeHref: "./",
    switchHref: "en/",
    switchLang: "en",
    switchLabel: "English",
    title: "最便宜的 DeepSeek 套餐？70 元档 Flash token 与撞墙对比",
    description: "OpenCode Go、Command Code GOAT、WorkBuddy 标准版：同样 10 美元 / 70 元，大概能用多少 DeepSeek Flash token，5 小时和周限额哪里会撞墙。",
    keywords: "最便宜的 DeepSeek 套餐, DeepSeek 套餐, DeepSeek Flash, 70元, 10美元, OpenCode Go, Command Code GOAT, WorkBuddy",
    keywordList: ["最便宜的 DeepSeek 套餐", "DeepSeek 套餐", "DeepSeek Flash", "70元", "10美元", "OpenCode Go", "Command Code GOAT", "WorkBuddy"],
    ogLocale: "zh_CN",
    ogLocaleAlternate: "en_US",
    ogImageAlt: "70 元 DeepSeek Flash 套餐 token 对比",
    skip: "跳到套餐表",
    promoAdLabel: "推广",
    promoAria: "推广：lmVPN",
    promoLinkAria: "了解 lmVPN（推广链接）",
    promoAlt: "lmVPN 蓝莓加速器：免费试用，日套餐 3 元起",
    promo88Aria: "推广：88API Claude 中转站",
    promo88LinkAria: "了解 88API（推广链接）",
    promo88Alt: "88API Claude 中转站：Opus / Sonnet / Haiku 全系模型，注册送测试额度",
    navAria: "站内导航",
    nav: [
      ["#plans", "token 对比"],
      ["#wall", "撞墙"],
      ["#method", "数字怎么来的"]
    ],
    eyebrow: "同样 10 美元 / 70 元这一档",
    h1: "最便宜的 DeepSeek 套餐？70 元档 Flash token 对比",
    lede: "只比三家：<strong>OpenCode Go</strong>、<strong>Command Code GOAT</strong>、<strong>WorkBuddy 标准版</strong>。看大概 token 数，也看 5 小时 / 每周限额会在哪里撞墙。",
    dataNote: "数据截至 2026-10-30，官方调价后这里不会自动跟着变，下单前以各平台官方页为准。",
    verdict: "结论：同样约 70 元，<strong>OpenCode Go 的估算 token 最多（约 33 亿）</strong>，但更容易先撞 5 小时墙；Command Code GOAT 约 31 亿；WorkBuddy 约 24 亿，不撞时间窗口，积分用完为止。",
    plansTitle: "同样 70 元，大概能跑多少 token",
    plansIntro: "按作者 2026-10-14 至 10-30 的实测用量和缓存命中率估算，单位约等于“含缓存 token”。",
    plansRegionAria: "70 元 DeepSeek Flash 套餐 token 对比",
    plansCaption: "三家的官方额度、实测估算 token 数和缓存命中率。",
    plansHeaders: ["套餐", "月费", "官方额度", "大概 token", "缓存命中率"],
    wallTitle: "撞墙点",
    wallIntro: "月额度不等于随时都能用完。高频使用时，先卡住的往往是 5 小时或每周窗口。",
    wallRegionAria: "套餐限额与撞墙说明",
    wallCaption: "三家的公开限额与撞墙说明。",
    wallHeaders: ["套餐", "公开限额", "实际会怎么撞墙"],
    methodTitle: "数字怎么来的",
    methodItems: [
      "样本：2026-10-14 至 10-30，三家一共 121,105 次成功调用。",
      "按真实缓存命中率估算：OpenCode 93.09%、Command Code 92.40%、WorkBuddy 96.36%。",
      "官方单价：输入 $0.15、输出 $0.60、缓存读取 $0.003 / 1M tokens；忙时价格翻倍。",
      "月额度和 5 小时 / 周限额为 2026-10-30 官方页快照，之后可能调整。",
      `完整计算过程和采样明细见<a href="${ARTICLE_URL}" rel="noopener">原文</a>。`
    ],
    faqTitle: "常见问题",
    workbuddyInvite: "邀请注册领 2000 积分",
    workbuddyInviteAria: "WorkBuddy 邀请注册（推广链接）",
    footerDisclaimer: "价格和限额以各平台官方页为准；token 数是实测估算，不是官方承诺。本项目不构成购买建议。",
    sourceLabel: "原文"
  },
  en: {
    lang: "en",
    assetBase: "../",
    homeHref: "../",
    switchHref: "../",
    switchLang: "zh-CN",
    switchLabel: "中文",
    title: "Cheapest DeepSeek Plan? $10 DeepSeek Flash Token Limits Compared",
    description: "OpenCode Go, Command Code GOAT, and WorkBuddy at roughly $10/month: estimated DeepSeek Flash tokens, cache-hit rates, and where the 5-hour and weekly usage walls hit.",
    keywords: "cheapest DeepSeek plan, DeepSeek pricing, DeepSeek Flash, DeepSeek subscription, OpenCode Go, Command Code GOAT, WorkBuddy",
    keywordList: ["cheapest DeepSeek plan", "DeepSeek pricing", "DeepSeek Flash", "DeepSeek subscription", "OpenCode Go", "Command Code GOAT", "WorkBuddy"],
    ogLocale: "en_US",
    ogLocaleAlternate: "zh_CN",
    ogImageAlt: "DeepSeek Flash plans at $10: token and usage-wall comparison",
    skip: "Skip to the plan comparison",
    promoAdLabel: "Ad",
    promoAria: "Advertisement: lmVPN",
    promoLinkAria: "Learn about lmVPN (sponsored link)",
    promoAlt: "lmVPN: free trial and a daily plan from 3 yuan",
    promo88Aria: "Advertisement: 88API Claude API relay",
    promo88LinkAria: "Learn about 88API (sponsored link)",
    promo88Alt: "88API Claude API relay: Opus, Sonnet, and Haiku models with sign-up bonus credits",
    navAria: "Page navigation",
    nav: [
      ["#plans", "Token comparison"],
      ["#wall", "Usage walls"],
      ["#method", "Method"]
    ],
    eyebrow: "The same $10 / ¥70 tier",
    h1: "What is the cheapest DeepSeek plan? Three $10 Flash plans compared",
    lede: "We compare only three plans: <strong>OpenCode Go</strong>, <strong>Command Code GOAT</strong>, and <strong>WorkBuddy Standard</strong>. See the estimated DeepSeek Flash tokens and where the 5-hour and weekly usage walls hit.",
    dataNote: "Data as of October 30, 2026. Prices and limits can change; confirm on each provider's official page before buying.",
    verdict: "Bottom line: at about $10/month, <strong>OpenCode Go has the highest estimated token count (~3.3B)</strong>, but it is the easiest to hit the 5-hour wall. Command Code GOAT is close at ~3.1B. WorkBuddy offers ~2.4B with no time-window wall, but stops when its credits run out.",
    plansTitle: "How many DeepSeek Flash tokens do you get for about $10?",
    plansIntro: "Estimated from the author's measured usage and cache-hit rates between October 14 and 30, 2026. Token counts include cached tokens.",
    plansRegionAria: "DeepSeek Flash token comparison for plans around $10",
    plansCaption: "Official quotas, estimated token counts, and measured cache-hit rates for all three plans.",
    plansHeaders: ["Plan", "Monthly price", "Official quota", "Est. tokens", "Cache hit rate"],
    wallTitle: "Where you hit the usage wall",
    wallIntro: "A monthly quota does not mean you can spend it all at once. Under heavy use, the 5-hour or weekly window usually hits first.",
    wallRegionAria: "Plan limits and usage-wall behavior",
    wallCaption: "Published limits and practical wall behavior for all three plans.",
    wallHeaders: ["Plan", "Published limit", "What actually hits first"],
    methodTitle: "How we calculated the numbers",
    methodItems: [
      "Sample: 121,105 successful calls across all three providers, October 14-30, 2026.",
      "Estimated using measured cache-hit rates: OpenCode 93.09%, Command Code 92.40%, WorkBuddy 96.36%.",
      "Official DeepSeek prices: $0.15 input, $0.60 output, and $0.003 cached input per 1M tokens; peak-hour prices double.",
      "Monthly quotas and 5-hour/weekly limits are snapshots from official pages on October 30, 2026 and may change.",
      `See the <a href="${ARTICLE_URL}" rel="noopener">source article</a> (Chinese) for the full methodology and samples.`
    ],
    faqTitle: "Frequently asked questions",
    workbuddyInvite: "Get 2,000 credits with this invite",
    workbuddyInviteAria: "WorkBuddy invite registration (sponsored link)",
    footerDisclaimer: "Prices and limits are subject to change; token counts are estimates, not official guarantees. This page is not purchase advice.",
    sourceLabel: "Source article"
  }
};

function jsonLd({ config, copy, faqs, plans, siteUrl }) {
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: copy.title,
    description: copy.description,
    url: siteUrl,
    sameAs: `https://github.com/${config.repository}`,
    license: "https://opensource.org/licenses/MIT",
    inLanguage: copy.lang,
    dateModified: "2026-10-30",
    keywords: copy.keywordList,
    variableMeasured: plans.map((plan) => `${plan.name}: ${plan.tokens}`),
    creator: { "@type": "Organization", name: config.name }
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: copy.lang,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };
  return [dataset, faq]
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
}

export function renderIndex({ config, origin, locale = "zh-CN", workbuddyUrl = WORKBUDDY_FALLBACK_URL }) {
  const copy = copyByLocale[locale] ?? copyByLocale["zh-CN"];
  const plans = focusPlans[locale] ?? focusPlans["zh-CN"];
  const faqs = faqItems[locale] ?? faqItems["zh-CN"];
  const siteUrl = locale === "en" ? `${origin}/en/` : `${origin}/`;
  const zhUrl = `${origin}/`;
  const enUrl = `${origin}/en/`;

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(copy.title)}</title>
  <meta name="description" content="${escapeHtml(copy.description)}">
  <meta name="keywords" content="${escapeHtml(copy.keywords)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#fff8ef">
  <link rel="canonical" href="${escapeHtml(siteUrl)}">
  <link rel="alternate" hreflang="zh-CN" href="${escapeHtml(zhUrl)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(zhUrl)}">
  <link rel="alternate" type="application/json" href="${escapeHtml(origin)}/data/pricing.json">
  <link rel="alternate" type="application/rss+xml" title="DeepSeek Flash pricing updates" href="${escapeHtml(origin)}/feed.xml">
  <link rel="sitemap" type="application/xml" href="${escapeHtml(origin)}/sitemap.xml">
  <link rel="manifest" href="${copy.assetBase}manifest.webmanifest">
  <link rel="icon" href="${copy.assetBase}favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(config.name)}">
  <meta property="og:title" content="${escapeHtml(copy.title)}">
  <meta property="og:description" content="${escapeHtml(copy.description)}">
  <meta property="og:url" content="${escapeHtml(siteUrl)}">
  <meta property="og:locale" content="${copy.ogLocale}">
  <meta property="og:locale:alternate" content="${copy.ogLocaleAlternate}">
  <meta property="og:image" content="${escapeHtml(origin)}/social.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(copy.ogImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(copy.title)}">
  <meta name="twitter:description" content="${escapeHtml(copy.description)}">
  <meta name="twitter:image" content="${escapeHtml(origin)}/social.png">
  <meta name="twitter:image:alt" content="${escapeHtml(copy.ogImageAlt)}">
  <meta name="author" content="4qin">
  <link rel="author" href="https://www.4qin.com/">
  <link rel="stylesheet" href="${copy.assetBase}styles.css">
  ${jsonLd({ config, copy, faqs, plans, siteUrl })}
</head>
<body>
  <a class="skip" href="#plans">${escapeHtml(copy.skip)}</a>
  <aside class="promo" aria-label="${escapeHtml(copy.promoAria)}">
    <div class="shell promo-inner">
      <span class="promo-label">${escapeHtml(copy.promoAdLabel)}</span>
      <a href="${escapeHtml(LMVPN_URL)}" target="_blank" rel="nofollow sponsored noopener" aria-label="${escapeHtml(copy.promoLinkAria)}">
        <picture>
          <source media="(max-width: 640px)" srcset="${copy.assetBase}lmvpn-banner-mobile.svg">
          <img src="${copy.assetBase}lmvpn-banner.svg" alt="${escapeHtml(copy.promoAlt)}" width="1200" height="200" loading="lazy" decoding="async">
        </picture>
      </a>
    </div>
  </aside>
  <header>
    <div class="shell header-row">
      <a class="brand" href="${copy.homeHref}" hreflang="${copy.lang}">Cheapest DeepSeek Plan</a>
      <nav aria-label="${escapeHtml(copy.navAria)}">
        ${copy.nav.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join("")}
        <a class="lang-switch" href="${copy.switchHref}" hreflang="${copy.switchLang}" lang="${copy.switchLang}">${escapeHtml(copy.switchLabel)}</a>
      </nav>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="shell">
        <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
        <h1>${escapeHtml(copy.h1)}</h1>
        <p class="lede">${copy.lede}</p>
        <p class="muted">${escapeHtml(copy.dataNote)}</p>
        <p class="verdict">${copy.verdict}</p>
        <div class="cards">
          ${plans
            .map(
              (plan) => `
          <article class="card${plan.invite ? " card-workbuddy" : ""}">
            <p class="eyebrow">${escapeHtml(plan.name)}</p>
            <p class="value">${escapeHtml(plan.tokens)}</p>
            <p class="muted">${escapeHtml(plan.tokensNote)} · ${escapeHtml(plan.price)}</p>
            ${
              plan.invite
                ? `<a class="card-invite" href="${escapeHtml(workbuddyUrl)}" target="_blank" rel="nofollow sponsored noopener" aria-label="${escapeHtml(copy.workbuddyInviteAria)}">${escapeHtml(copy.workbuddyInvite)} <span aria-hidden="true">→</span></a>`
                : ""
            }
          </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <aside class="promo promo-inline" aria-label="${escapeHtml(copy.promo88Aria)}">
      <div class="shell promo-inner">
        <span class="promo-label">${escapeHtml(copy.promoAdLabel)}</span>
        <a href="${escapeHtml(API88_URL)}" target="_blank" rel="nofollow sponsored noopener" aria-label="${escapeHtml(copy.promo88LinkAria)}">
          <picture>
            <source media="(max-width: 640px)" srcset="${copy.assetBase}88api-banner-mobile.svg">
            <img src="${copy.assetBase}88api-banner.svg" alt="${escapeHtml(copy.promo88Alt)}" width="1200" height="200" loading="lazy" decoding="async">
          </picture>
        </a>
      </div>
    </aside>

    <section id="plans" class="section">
      <div class="shell">
        <div class="section-head">
          <h2>${escapeHtml(copy.plansTitle)}</h2>
          <p>${escapeHtml(copy.plansIntro)}</p>
        </div>
        <div class="table-wrap" role="region" aria-label="${escapeHtml(copy.plansRegionAria)}" tabindex="0">
          <table>
            <caption>${escapeHtml(copy.plansCaption)}</caption>
            <thead>
              <tr>${copy.plansHeaders.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${plans
                .map(
                  (plan) => `
              <tr>
                <td><strong>${escapeHtml(plan.name)}</strong></td>
                <td>${escapeHtml(plan.price)}</td>
                <td>${escapeHtml(plan.quota)}</td>
                <td><strong>${escapeHtml(plan.tokens)}</strong> <span class="muted">${escapeHtml(plan.tokensNote)}</span></td>
                <td>${escapeHtml(plan.cache)}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section id="wall" class="section alt">
      <div class="shell">
        <div class="section-head">
          <h2>${escapeHtml(copy.wallTitle)}</h2>
          <p>${escapeHtml(copy.wallIntro)}</p>
        </div>
        <div class="table-wrap" role="region" aria-label="${escapeHtml(copy.wallRegionAria)}" tabindex="0">
          <table>
            <caption>${escapeHtml(copy.wallCaption)}</caption>
            <thead>
              <tr>${copy.wallHeaders.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${plans
                .map(
                  (plan) => `
              <tr>
                <td><strong>${escapeHtml(plan.name)}</strong></td>
                <td>${escapeHtml(plan.limit)}</td>
                <td>${escapeHtml(plan.wall)}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section id="method" class="section">
      <div class="shell">
        <h2>${escapeHtml(copy.methodTitle)}</h2>
        <ul class="plain-list">
          ${copy.methodItems.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section id="faq" class="section alt">
      <div class="shell">
        <h2>${escapeHtml(copy.faqTitle)}</h2>
        ${faqs.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("")}
      </div>
    </section>
  </main>
  <footer>
    <div class="shell">
      <p>${escapeHtml(copy.footerDisclaimer)}</p>
      <p><a href="${escapeHtml(ARTICLE_URL)}" rel="noopener">${escapeHtml(copy.sourceLabel)}</a> · <a href="https://github.com/${escapeHtml(config.repository)}">GitHub</a> · MIT</p>
    </div>
  </footer>
</body>
</html>`;
}

export function renderSitemap(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${origin}/</loc>
    <lastmod>2026-10-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${origin}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${origin}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/"/>
  </url>
  <url>
    <loc>${origin}/en/</loc>
    <lastmod>2026-10-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${origin}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${origin}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/"/>
  </url>
</urlset>
`;
}

export function renderFeed(document, origin) {
  const siteUrl = `${origin}/`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>最便宜的 DeepSeek 套餐：70 元 Flash token 对比</title>
    <link>${siteUrl}</link>
    <description>OpenCode Go、Command Code GOAT、WorkBuddy 标准版的大致 token 数与撞墙说明。</description>
    <language>zh-cn</language>
    <pubDate>${new Date(document.updated_at).toUTCString()}</pubDate>
    <lastBuildDate>${new Date(document.updated_at).toUTCString()}</lastBuildDate>
  </channel>
</rss>
`;
}

export function renderRobots(origin) {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

export function renderLlms(document, origin, config) {
  return `# ${config.name}

> 最便宜的 DeepSeek 套餐：同样 70 元 / $10，DeepSeek Flash 大概能跑多少 token，哪里会撞墙。
> The cheapest DeepSeek plans around $10: estimated Flash token counts and usage walls in Chinese and English.

## Pages

- 中文: ${origin}/
- English: ${origin}/en/
- Source article: ${ARTICLE_URL}
- License: MIT

## Topics

Cheapest DeepSeek plan, DeepSeek Flash pricing, OpenCode Go, Command Code GOAT, WorkBuddy, token estimates, 5-hour and weekly usage limits.
`;
}

export function renderManifest(config) {
  return JSON.stringify(
    {
      name: config.name,
      short_name: "DeepSeek Plans",
      start_url: ".",
      display: "minimal-ui",
      background_color: "#fff8ef",
      theme_color: "#ff5a1f",
      icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }]
    },
    null,
    2
  );
}
