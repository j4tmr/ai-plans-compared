# Cheapest DeepSeek Plan

同样 **70 元 / $10** 这一档，DeepSeek Flash 大概能跑多少 token，哪里会撞墙。

在线页面：https://j4tmr.github.io/cheapest-deepseek-plan/

原文：https://www.4qin.com/p/three-plans-70-yuan-deepseek-tokens-20261030

## 对比

| 套餐 | 月费 | 官方额度 | 大概 token | 撞墙点 |
| --- | ---: | --- | ---: | --- |
| OpenCode Go | $10 | Flash 每月 $80 | 约 33 亿（含缓存） | 5 小时最多用当月额度 20%，每周最多 50% |
| Command Code GOAT | $10 | Flash 每月 $80（采样期 $60） | 约 31 亿（含缓存） | 5 小时 $20，每周 $50 |
| WorkBuddy 标准版 | ¥70 | 4000 积分 / 月 | 约 24 亿（含缓存） | 积分用完为止 |

## 数字怎么来的

- 数据来自 Magpie：2026-10-14 至 10-30，三家共 121,105 次成功调用。
- 按真实缓存命中率估算：OpenCode 93.09%、Command Code 92.40%、WorkBuddy 96.36%。
- 官方单价：输入 $0.15、输出 $0.60、缓存读取 $0.003 / 1M tokens；忙时价格翻倍。
- 月额度和 5 小时 / 周限额为 2026-10-30 官方页快照。
- 更完整的采样和计算过程见原文。

## 说明

- token 数是实测估算，不是官方承诺。
- 价格和限额以各平台官方页为准。
- 本项目与 DeepSeek、WorkBuddy、OpenCode、Command Code 均无隶属关系。

## 本地运行

```bash
npm install
npm test
npm run build    # 生成 public/ 静态页
```

页面部署在 GitHub Pages；`.github/workflows/update-prices.yml` 会定时抓取官方价格数据。

## License

[MIT](LICENSE)
