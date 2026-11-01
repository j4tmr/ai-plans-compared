const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ARTICLE_URL = "https://www.4qin.com/p/three-plans-70-yuan-deepseek-tokens-20261030";

// 来自《70 元 DeepSeek 三套餐对比》原文的实测结论。
const focusPlans = [
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
    cache: "96.36%"
  }
];

const faqItems = () => [
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
];

function jsonLd(config) {
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "70 元 DeepSeek Flash 套餐 token 对比",
    description: "OpenCode Go、Command Code GOAT、WorkBuddy 标准版在同样 70 元 / $10 档位的大致 token 数与撞墙说明。",
    url: "https://j4tmr.github.io/cheapest-deepseek-plan/",
    sameAs: `https://github.com/${config.repository}`,
    license: "https://opensource.org/licenses/MIT",
    creator: { "@type": "Organization", name: config.name }
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems().map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };
  return [dataset, faq]
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
}

export function renderIndex({ config, origin }) {
  const siteUrl = `${origin}/`;
  const title = "70 元 DeepSeek Flash 套餐对比：大概能跑多少 token、哪里会撞墙";
  const description = "OpenCode Go、Command Code GOAT、WorkBuddy 标准版：同样 10 美元 / 70 元，大概能用多少 DeepSeek Flash token，5 小时和周限额哪里会撞墙。";

  return `<!doctype html>
<html lang="${escapeHtml(config.locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#fff8ef">
  <link rel="canonical" href="${escapeHtml(siteUrl)}">
  <link rel="alternate" type="application/json" href="${escapeHtml(origin)}/data/pricing.json">
  <link rel="alternate" type="application/rss+xml" title="DeepSeek Flash pricing updates" href="${escapeHtml(origin)}/feed.xml">
  <link rel="sitemap" type="application/xml" href="${escapeHtml(origin)}/sitemap.xml">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(config.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(siteUrl)}">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:image" content="${escapeHtml(origin)}/social.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(origin)}/social.png">
  <link rel="stylesheet" href="styles.css">
  ${jsonLd(config)}
</head>
<body>
  <a class="skip" href="#plans">跳到套餐表</a>
  <header>
    <div class="shell header-row">
      <a class="brand" href="./">Cheapest DeepSeek Plan</a>
      <nav aria-label="站内导航">
        <a href="#plans">token 对比</a>
        <a href="#wall">撞墙</a>
        <a href="#method">数字怎么来的</a>
      </nav>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="shell">
        <p class="eyebrow">同样 10 美元 / 70 元这一档</p>
        <h1>70 元 DeepSeek Flash，大概能跑多少 token？</h1>
        <p class="lede">
          只比三家：<strong>OpenCode Go</strong>、<strong>Command Code GOAT</strong>、<strong>WorkBuddy 标准版</strong>。
          看大概 token 数，也看 5 小时 / 每周限额会在哪里撞墙。
        </p>
        <p class="muted">数据截至 2026-10-30，官方调价后这里不会自动跟着变，下单前以各平台官方页为准。</p>
        <div class="cards">
          ${focusPlans
            .map(
              (plan) => `
          <article class="card">
            <p class="eyebrow">${escapeHtml(plan.name)}</p>
            <p class="value">${escapeHtml(plan.tokens)}</p>
            <p class="muted">${escapeHtml(plan.tokensNote)} · ${escapeHtml(plan.price)}</p>
          </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section id="plans" class="section">
      <div class="shell">
        <div class="section-head">
          <h2>同样 70 元，大概能跑多少 token</h2>
          <p>按作者 2026-10-14 至 10-30 的实测用量和缓存命中率估算，单位约等于“含缓存 token”。</p>
        </div>
        <div class="table-wrap" role="region" aria-label="70 元 DeepSeek Flash 套餐 token 对比" tabindex="0">
          <table>
            <caption>三家的官方额度、实测估算 token 数和缓存命中率。</caption>
            <thead>
              <tr>
                <th scope="col">套餐</th>
                <th scope="col">月费</th>
                <th scope="col">官方额度</th>
                <th scope="col">大概 token</th>
                <th scope="col">缓存命中率</th>
              </tr>
            </thead>
            <tbody>
              ${focusPlans
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
          <h2>撞墙点</h2>
          <p>月额度不等于随时都能用完。高频使用时，先卡住的往往是 5 小时或每周窗口。</p>
        </div>
        <div class="table-wrap" role="region" aria-label="套餐限额与撞墙说明" tabindex="0">
          <table>
            <caption>三家的公开限额与撞墙说明。</caption>
            <thead>
              <tr>
                <th scope="col">套餐</th>
                <th scope="col">公开限额</th>
                <th scope="col">实际会怎么撞墙</th>
              </tr>
            </thead>
            <tbody>
              ${focusPlans
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
        <h2>数字怎么来的</h2>
        <ul class="plain-list">
          <li>样本：2026-10-14 至 10-30，三家一共 121,105 次成功调用。</li>
          <li>按真实缓存命中率估算：OpenCode 93.09%、Command Code 92.40%、WorkBuddy 96.36%。</li>
          <li>官方单价：输入 $0.15、输出 $0.60、缓存读取 $0.003 / 1M tokens；忙时价格翻倍。</li>
          <li>月额度和 5 小时 / 周限额为 2026-10-30 官方页快照，之后可能调整。</li>
          <li>完整计算过程和采样明细见<a href="${escapeHtml(ARTICLE_URL)}" rel="noopener">原文</a>。</li>
        </ul>
      </div>
    </section>

    <section id="faq" class="section alt">
      <div class="shell">
        <h2>常见问题</h2>
        ${faqItems().map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("")}
      </div>
    </section>
  </main>
  <footer>
    <div class="shell">
      <p>价格和限额以各平台官方页为准；token 数是实测估算，不是官方承诺。本项目不构成购买建议。</p>
      <p><a href="${escapeHtml(ARTICLE_URL)}" rel="noopener">原文</a> · <a href="https://github.com/${escapeHtml(config.repository)}">GitHub</a> · MIT</p>
    </div>
  </footer>
</body>
</html>`;
}

export function renderSitemap(origin) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

export function renderFeed(document, origin) {
  const siteUrl = `${origin}/`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>70 元 DeepSeek Flash 套餐 token 对比</title>
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

> 同样 70 元 / $10，DeepSeek Flash 大概能跑多少 token，哪里会撞墙。

## 数据

- HTML: ${origin}/
- 原文: ${ARTICLE_URL}
- License: MIT

## 主题

OpenCode Go、Command Code GOAT、WorkBuddy 标准版，DeepSeek Flash token 估算与 5 小时 / 每周限额。
`;
}

export function renderManifest(config) {
  return JSON.stringify(
    {
      name: config.name,
      short_name: "DeepSeek 70 元",
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
