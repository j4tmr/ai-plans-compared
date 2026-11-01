# Methodology

The project separates facts from estimates.

## Official API baseline

DeepSeek publishes `deepseek-flash`, currently backed by `DeepSeek-V4.1-Flash`, with separate off-peak and peak prices. The site stores both. For quick comparison it also shows a **balanced off-peak rate**:

```text
balanced = (off_peak_input + off_peak_output) / 2
```

This is a reference, not a prediction of real traffic.

## Dollar-value quotas

OpenCode and Command Code express some plan allowances as a dollar amount of model usage. For DeepSeek Flash, the site converts that value to an estimated token amount with the official off-peak balanced rate. This is conservative and avoids pretending that credits are tokens.

## Credits

WorkBuddy publishes credits, not tokens. The site applies the Tokenkoi community-measured assumption of 600,000 tokens per credit and marks the result as `low` confidence. If WorkBuddy later publishes an official conversion, replace it in `data/plans.seed.json` and cite the official page.

## Ranking

The table has two rankings:

1. **Lowest monthly price** — paid subscriptions that can include DeepSeek Flash, converted to CNY when an FX rate exists.
2. **Lowest estimated unit cost** — normalized `price_per_1m_tokens_cny`, excluding free trials.

The table never presents only one ranking as if it were the only answer. A plan with a very low entry price can have less usable quota, and a plan with the lowest unit cost can be unsuitable for light users.

## Failure behavior

Each source is parsed independently. If one page changes or is temporarily unavailable, the updater keeps that source's previous rows and marks them `stale`. It does not erase them or substitute another vendor's price.
