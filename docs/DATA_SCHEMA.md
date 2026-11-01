# Data schema

`data/pricing.json` is the canonical snapshot. `public/data/pricing.json` is the deployable copy.

## Top level

| Field | Type | Meaning |
| --- | --- | --- |
| `schema_version` | number | Version of this normalized document. |
| `updated_at` | ISO 8601 | Latest time the pricing content changed. |
| `checked_at` | ISO 8601 | Latest time a refresh was attempted, even if nothing changed. |
| `focus_model` | object | Official DeepSeek Flash model, version, context and API rates. |
| `fx` | object \| null | USD→CNY rate used by this snapshot, with source and date. |
| `sources` | array | Per-source fetch status. A failed source keeps old data and marks it `stale`. |
| `recommendations` | object | Explicit recommendation objects; they never hide the calculation method. |
| `plans` | array | Normalized plan rows. |

## Plan fields

| Field | Meaning |
| --- | --- |
| `price` | Recurring price for the selected billing option. |
| `price_period` | `month` or `year`; normalized monthly price uses this. |
| `billing_option` | For WorkBuddy, `continuous_month` is preferred over the list-price `monthly`. |
| `included_usage` | The plan's general quota, if published. |
| `model_usage` | The quota tied specifically to DeepSeek V4.1 Flash when the vendor publishes one. |
| `usage_value_multiplier` | For dollar-value quotas: included dollars divided by monthly price. |
| `estimated_tokens_millions` | Estimated million tokens implied by the documented quota and assumptions. |
| `price_per_1m_tokens` | Normalized unit cost in the plan's own currency. |
| `price_per_1m_tokens_cny` | Same unit cost converted to CNY when an FX rate is available. |
| `confidence` | `official`, `high`, `medium` or `low`. |
| `stale` | True when the last fetch failed and the row was carried forward. |

## Design rules

- Do not add a field that cannot be traced to an official page or an explicit assumption.
- Do not silently convert credits or tokens between platforms.
- Do not let a failed source erase data; keep the previous row and set `stale: true`.
- Add a test fixture before changing a parser.
