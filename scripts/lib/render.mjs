const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatMoney = (plan) => {
  if (plan.price == null) return "按量";
  const symbol = plan.currency === "CNY" ? "¥" : plan.currency === "USD" ? "$" : "";
  return `${symbol}${plan.price.toLocaleString("zh-CN")}`;
};

const formatUsage = (plan) => {
  if (plan.model_usage?.kind === "currency" && plan.model_usage.amount != null) {
    return `$${plan.model_usage.amount.toLocaleString("zh-CN")} / 月`;
  }
  if (plan.included_usage?.kind === "credits" && plan.included_usage.amount != null) {
    return `${plan.included_usage.amount.toLocaleString("zh-CN")} 积分 / 月`;
  }
  if (plan.included_usage?.kind === "none") return "无固定额度";
  return plan.included_usage?.note || "—";
};

const confidenceLabels = {
  official: "官方",
  high: "高",
  medium: "中",
  low: "低"
};

const formatEstimate = (plan) => {
  if (plan.price_per_1m_tokens_cny == null) return "—";
  return `¥${plan.price_per_1m_tokens_cny}`;
};

const badge = (label) => `<span class="badge">${escapeHtml(label)}</span>`;

function planRow(plan) {
  const rank = plan.rank_by_estimated_cost ?? plan.rank_by_monthly_price ?? "—";
  const badges = [];
  if (plan.stale) badges.push("上次抓取失败");
  if (plan.tags.includes("free_trial")) badges.push("免费体验");
  if (plan.rank_by_estimated_cost === 1) badges.push("估算成本最低");
  if (plan.rank_by_monthly_price === 1) badges.push("月费最低");
  return `
    <tr>
      <td data-label="排名" class="rank">${escapeHtml(rank)}</td>
      <td data-label="平台 / 套餐">
        <strong>${escapeHtml(plan.vendor)} · ${escapeHtml(plan.name)}</strong>
        <span class="muted">${escapeHtml(plan.per === "member" ? "按成员计费" : plan.billing_option === "continuous_month" ? "连续包月" : "月付")}</span>
        ${badges.length ? `<div class="badges">${badges.map(badge).join("")}</div>` : ""}
      </td>
      <td data-label="月费">${escapeHtml(formatMoney(plan))}</td>
      <td data-label="DeepSeek 额度">${escapeHtml(formatUsage(plan))}</td>
      <td data-label="估算额度">${plan.estimated_tokens_millions == null ? "—" : `${escapeHtml(plan.estimated_tokens_millions)}M tokens`}</td>
      <td data-label="估算成本">${escapeHtml(formatEstimate(plan))}</td>
      <td data-label="置信度">${escapeHtml(confidenceLabels[plan.confidence] ?? "—")}</td>
      <td data-label="说明">${escapeHtml(plan.notes || "—")}</td>
    </tr>
  `;
}

function sourceRow(source) {
  return `
    <tr>
      <td data-label="来源"><a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.name)}</a></td>
      <td data-label="状态">${source.status === "ok" ? "抓取成功" : "抓取失败"}</td>
      <td data-label="时间">${escapeHtml(source.fetched_at || source.verified_at || "—")}</td>
      <td data-label="备注">${escapeHtml(source.message || `收录 ${source.plans_count ?? 0} 个套餐`)}</td>
    </tr>
  `;
}

function faqItems() {
  return [
    {
      q: "现在最便宜的 DeepSeek Flash 套餐是哪一个？",
      a: "页面同时看两个口径：月费最低看已收录的付费订阅；单位成本最低看折算后的 ¥/1M tokens。不同平台额度和模型范围不同，建议先看口径再选套餐。"
    },
    {
      q: "DeepSeek Flash 官方价格怎么算？",
      a: "官方 API 按 token 计费，错峰和高峰价不同；本站用错峰输入和输出的 50:50 组合价作为参考，不预测实际请求比例。"
    },
    {
      q: "WorkBuddy 的积分为什么有低置信度？",
      a: "WorkBuddy 公开的是积分，不是固定 token 数。Tokenkoi 的社区实测给出约 600,000 tokens/credit 的换算，但实际会随缓存命中率和任务结构变化。"
    },
    {
      q: "数据多久更新一次？",
      a: "GitHub Actions 默认每 6 小时抓取一次；如果某次抓取失败，数据会保留并标记为 stale，下一次成功后自动恢复。"
    }
  ];
}

function jsonLd(document, origin, config) {
  const siteUrl = `${origin}/`;
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems().map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Cheapest DeepSeek Flash Plans",
    description: "WorkBuddy、OpenCode、Command Code 与 DeepSeek 官方 API 的 DeepSeek V4.1 Flash 价格快照。",
    url: siteUrl,
    sameAs: `https://github.com/${config.repository}`,
    license: "https://opensource.org/licenses/MIT",
    dateModified: document.updated_at,
    creator: { "@type": "Organization", name: config.name },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${origin}/data/pricing.json`
    }
  };
  return [dataset, faq].map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`).join("\n");
}

export function renderIndex({ document, config, origin }) {
  const siteUrl = `${origin}/`;
  const title = "DeepSeek Flash 最便宜套餐对比 | WorkBuddy · OpenCode · Command Code · 官方 API";
  const description = "自动追踪 WorkBuddy、OpenCode、Command Code 和 DeepSeek 官方 API 的最新 Flash 套餐价格，按月费、额度和估算 token 成本排序。";
  const plans = [...document.plans]
    .filter((plan) => plan.kind !== "api_baseline")
    .sort((a, b) => (a.rank_by_estimated_cost ?? 999) - (b.rank_by_estimated_cost ?? 999) || (a.rank_by_monthly_price ?? 999) - (b.rank_by_monthly_price ?? 999));
  const official = document.plans.find((plan) => plan.kind === "api_baseline");
  const sources = document.sources ?? [];
  const faq = faqItems();
  const recommendation = (label, value, note) => `
    <article class="card">
      <p class="eyebrow">${escapeHtml(label)}</p>
      <p class="value">${escapeHtml(value)}</p>
      <p class="muted">${escapeHtml(note)}</p>
    </article>
  `;
  const planName = (id) => {
    const plan = document.plans.find((item) => item.id === id);
    return plan ? `${plan.vendor} ${plan.name}` : "—";
  };
  const lowestMonthly = document.recommendations?.lowest_monthly_price;
  const lowestEstimate = document.recommendations?.lowest_estimated_unit_cost;
  const freeTrial = document.recommendations?.free_trial;

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
  <meta property="og:image" content="${escapeHtml(origin)}/social.svg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(origin)}/social.svg">
  <link rel="stylesheet" href="styles.css">
  ${jsonLd(document, origin, config)}
</head>
<body>
  <a class="skip" href="#plans">跳到套餐表</a>
  <header>
    <div class="shell header-row">
      <a class="brand" href="./">Cheapest DeepSeek Plan</a>
      <nav aria-label="站内导航">
        <a href="#plans">套餐表</a>
        <a href="#method">口径</a>
        <a href="#sources">来源</a>
        <a href="#faq">FAQ</a>
      </nav>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="shell">
        <p class="eyebrow">GitHub Actions 每 6 小时更新</p>
        <h1>DeepSeek Flash 最便宜套餐对比</h1>
        <p class="lede">
          聚焦 <strong>${escapeHtml(document.focus_model.version)}</strong>，对比 WorkBuddy、OpenCode、Command Code 与官方 API。
          每条记录都保留来源、核验时间和折算假设。
        </p>
        <div class="cards">
          ${recommendation("月费最低", planName(lowestMonthly?.plan_id), lowestMonthly?.reason || "暂无可比套餐")}
          ${recommendation("估算成本最低", planName(lowestEstimate?.plan_id), lowestEstimate?.reason || "暂无可比套餐")}
          ${recommendation("免费体验", planName(freeTrial?.plan_id), freeTrial?.reason || "暂无公开免费档")}
          ${recommendation("官方按量基准", "DeepSeek 官方 API", `错峰 50:50 综合约 $${document.recommendations?.api_baseline?.balanced_off_peak_usd_per_1m_tokens ?? "—"}/1M tokens`)}
        </div>
      </div>
    </section>

    <section id="plans" class="section">
      <div class="shell">
        <div class="section-head">
          <h2>套餐对比</h2>
          <p>更新时间：${escapeHtml(document.updated_at)}；最近检查：${escapeHtml(document.checked_at)}</p>
        </div>
        <div class="table-wrap" role="region" aria-label="DeepSeek Flash 套餐对比" tabindex="0">
          <table>
            <caption>DeepSeek Flash 订阅套餐估算成本表。不同平台的额度不可直接互换，请结合口径和说明阅读。</caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">平台 / 套餐</th>
                <th scope="col">月费</th>
                <th scope="col">DeepSeek 额度</th>
                <th scope="col">估算额度</th>
                <th scope="col">估算 ¥/1M tokens</th>
                <th scope="col">置信度</th>
                <th scope="col">说明</th>
              </tr>
            </thead>
            <tbody>${plans.map(planRow).join("")}</tbody>
          </table>
        </div>
        <p class="muted">官方 API 基准：错峰输入 $${escapeHtml(document.focus_model.pricing.input_cache_miss.off_peak)}、输出 $${escapeHtml(document.focus_model.pricing.output.off_peak)} / 1M tokens；高峰分别 $${escapeHtml(document.focus_model.pricing.input_cache_miss.peak)}、$${escapeHtml(document.focus_model.pricing.output.peak)}。</p>
      </div>
    </section>

    <section id="method" class="section alt">
      <div class="shell">
        <h2>口径与限制</h2>
        <div class="method-grid">
          <article>
            <h3>月费最低</h3>
            <p>只比较已收录且包含 DeepSeek Flash 的付费订阅。汇率来自同一快照，避免跨币种硬拼。</p>
          </article>
          <article>
            <h3>估算成本最低</h3>
            <p>OpenCode 和 Command Code 用官方美元额度 ÷ Flash 官方错峰综合价；WorkBuddy 用积分换算假设。</p>
          </article>
          <article>
            <h3>不确定就标出来</h3>
            <p>抓取失败保留旧数据并标记 <code>stale</code>；额度单位不同时不用假汇率强行折算。</p>
          </article>
        </div>
      </div>
    </section>

    <section id="sources" class="section">
      <div class="shell">
        <h2>来源状态</h2>
        <div class="table-wrap" role="region" aria-label="价格来源状态" tabindex="0">
          <table>
            <thead>
              <tr>
                <th scope="col">来源</th><th scope="col">状态</th><th scope="col">时间</th><th scope="col">备注</th>
              </tr>
            </thead>
            <tbody>${sources.map(sourceRow).join("")}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section id="faq" class="section alt">
      <div class="shell">
        <h2>常见问题</h2>
        ${faq.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("")}
      </div>
    </section>
  </main>
  <footer>
    <div class="shell">
      <p>价格与条款以各平台官方页为准。本项目不构成购买建议。</p>
      <p><a href="data/pricing.json">JSON API</a> · <a href="sitemap.xml">Sitemap</a> · <a href="feed.xml">RSS</a> · <a href="https://github.com/${escapeHtml(config.repository)}">GitHub</a> · MIT</p>
    </div>
  </footer>
</body>
</html>`;
}

export function renderSitemap(origin) {
  const siteUrl = `${origin}/`;
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

export function renderFeed(document, origin) {
  const siteUrl = `${origin}/`;
  const title = "Cheapest DeepSeek Plan";
  const description = "DeepSeek Flash plan pricing snapshot.";
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeHtml(description)}</description>
    <language>zh-cn</language>
    <pubDate>${new Date(document.updated_at).toUTCString()}</pubDate>
    <lastBuildDate>${new Date(document.updated_at).toUTCString()}</lastBuildDate>
    <item>
      <title>DeepSeek Flash pricing snapshot ${escapeHtml(document.updated_at)}</title>
      <link>${siteUrl}</link>
      <guid>${siteUrl}#${document.updated_at}</guid>
      <pubDate>${new Date(document.updated_at).toUTCString()}</pubDate>
      <description>${escapeHtml(description)}</description>
    </item>
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
  const siteUrl = `${origin}/`;
  return `# ${config.name}

> ${document.focus_model.version} 价格快照，更新于 ${document.updated_at}。

## 数据

- JSON API: ${origin}/data/pricing.json
- HTML: ${siteUrl}
- License: MIT

## 主题

DeepSeek Flash 套餐对比、WorkBuddy、OpenCode、Command Code、官方 API 按量计费。
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
