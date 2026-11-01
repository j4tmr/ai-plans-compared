# Cheapest DeepSeek Plan

一个开源的 **DeepSeek V4.1 Flash（`deepseek-flash`）订阅套餐追踪器**。项目定时抓取并对比 WorkBuddy、OpenCode、Command Code 与 DeepSeek 官方 API 的当前公开价格，输出静态页面、可复用 JSON API 与可审计的采集快照。

> 本项目与 DeepSeek、WorkBuddy、OpenCode、Command Code 均无隶属关系；所有价格以各平台官方页面为准。

## 为什么做这个

DeepSeek Flash 的价格会因为官方调价、平台套餐调整、限免活动和高峰/错峰计费而变化。逐个查官网太慢，也容易看到过期价格。这个项目把这些公开页变成一个可复算的快照：

- **自动抓取**：GitHub Actions 每 6 小时抓一次官方页，失败时保留上一次数据并明确标记 `stale`。
- **可审计**：每条价格都带 `source_url` 和 `verified_at`；折算假设单独放在 `assumptions`。
- **不做黑箱推荐**：页面上同时给出“低门槛月费最低”和“估算单位成本最低”，不把不同平台不可直接互换的额度硬说成同一个东西。

## 当前快照

<!-- pricing:start -->
| # | 平台 / 套餐 | 月费 | 估算额度 | 估算 ¥/1M tokens | 置信度 |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | WorkBuddy 旗舰版 | ¥700 | 30000M | 0.023333 | low |
| 2 | WorkBuddy 高级版 | ¥140 | 5400M | 0.025926 | low |
| 3 | WorkBuddy 标准版 | ¥70 | 2400M | 0.029167 | low |
| 4 | OpenCode Go | $10 | 266.67M | 0.249484 | medium |
| 4 | Command Code Go | $1 | 26.67M | 0.249484 | medium |
| 4 | Command Code GOAT | $10 | 266.67M | 0.249484 | medium |
| 5 | Command Code Pro | $20 | 293.33M | 0.453607 | medium |
| 6 | OpenCode Go Teams | $20 | 280M | 0.475207 | medium |
| 7 | OpenCode Go Plus | $40 | 533.33M | 0.498967 | medium |
| 8 | Command Code Max 10× | $100 | 400M | 1.663225 | medium |
| 8 | Command Code Max 20× | $200 | 800M | 1.663225 | medium |
| 9 | Command Code Team Pro | $40 | 106.67M | 2.494838 | medium |
| — | WorkBuddy 体验版 | ¥0 | 300M | 0 | low |
<!-- pricing:end -->

## 数据来源

| 来源 | 用途 |
| --- | --- |
| [DeepSeek API 定价](https://api-docs.deepseek.com/quick_start/pricing/) | 官方 Flash 模型名、版本、上下文、输入/输出与缓存价 |
| [WorkBuddy 定价详情](https://www.workbuddy.cn/docs/workbuddy/Pricing) | 体验版、标准版、高级版、旗舰版价格与积分 |
| [OpenCode Go plan](https://opencode.ai/v2/docs/console/go) | Go / Go Plus / Go Teams 与 DeepSeek Flash 每月额度 |
| [Command Code Pricing & Limits](https://commandcode.ai/docs/resources/pricing-limits) | 个人/团队套餐、月度 credits 与 DeepSeek boosted credits |

WorkBuddy 的积分到 token 换算参考了 [Tokenkoi plans.json](https://github.com/4cola/tokenkoi) 的订阅套餐口径；本仓库只使用公开可复核的假设，不会把社区估算伪装成官方兑换率。

## 折算口径

1. **DeepSeek 官方 API**：只作为按量基准，不折算成订阅套餐。
2. **OpenCode / Command Code**：官方页以美元额度表达模型用量时，使用 Flash 官方错峰 50:50 输入/输出综合价折算 token 数。
3. **WorkBuddy**：官方公布的是积分，不是 token。这里使用 Tokenkoi 记录的社区实测换算 `600,000 tokens / credit`，置信度标记为 `low`，仅用于粗略比较。
4. **币种**：USD 会按同一快照里的汇率换算成 CNY；如果汇率源失败，跨币种排名会缺失而不是猜一个值。
5. **不做长期承诺价排名**：页面展示连续包月和月付原价，不把年付强行折成唯一最低价。

更细的字段定义见 [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md)，排序和注意事项见 [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md)。

## 本地运行

```bash
npm install
npm test
npm run update   # 抓取并刷新 data/pricing.json
npm run build    # 生成 public/ 下的静态站和 SEO 文件
```

生成物主要在：

- `public/index.html` — 可直接被搜索引擎读取的静态页。
- `public/data/pricing.json` — 结构化数据接口。
- `public/sitemap.xml` — sitemap。
- `public/feed.xml` — 最新快照 feed。

## CI

| Workflow | 作用 |
| --- | --- |
| `CI` | 跑解析器测试、构建站点，并检查生成文件是否最新。 |
| `Update prices` | 每 6 小时抓取公开页，成功后自动提交新快照。 |
| `Deploy Pages` | 构建 `public/` 并部署到 GitHub Pages。 |

仓库推到 GitHub 后，在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions** 即可。

## 贡献

欢迎提 Issue 或 PR：

1. 平台价格变了但抓取器没跟上，请提 [价格修正](.github/ISSUE_TEMPLATE/price-correction.yml)。
2. 新平台需要支持，请先说明官方页 URL、额度单位和是否包含 DeepSeek Flash。
3. 修改解析器时，请同步加一个最小 HTML fixture 测试。

## License

[MIT](LICENSE)
