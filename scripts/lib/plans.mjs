import { balancedRate, round } from "./number.mjs";

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

function monthlyPrice(plan) {
  if (!isNumber(plan.price)) return null;
  if (plan.price_period === "month") return plan.price;
  if (plan.price_period === "year") return plan.price / 12;
  return null;
}

function tokensPerCredit(seed, sourceId) {
  return seed.assumptions?.find((item) => item.source_id === sourceId)?.tokens_per_credit ?? null;
}

function estimate(plan, seed, officialModel) {
  if (plan.id === "deepseek_official_api") {
    const rate = balancedRate({
      input: officialModel.pricing.input_cache_miss.off_peak,
      output: officialModel.pricing.output.off_peak
    });
    return { price_per_1m_tokens: rate, estimated_tokens_millions: null, confidence: "official" };
  }

  if (plan.method === "included_value_to_tokens") {
    const rate = balancedRate({
      input: officialModel.pricing.input_cache_miss.off_peak,
      output: officialModel.pricing.output.off_peak
    });
    const amount = plan.model_usage?.amount;
    if (!isNumber(rate) || rate <= 0 || !isNumber(amount) || amount <= 0) return null;
    return {
      price_per_1m_tokens: (monthlyPrice(plan) * rate) / amount,
      estimated_tokens_millions: amount / rate,
      confidence: "medium"
    };
  }

  if (plan.method === "credit_assumption") {
    const perCredit = tokensPerCredit(seed, plan.source_id ?? plan.vendor_id);
    const credits = plan.included_usage?.amount;
    if (!isNumber(perCredit) || perCredit <= 0 || !isNumber(credits) || credits <= 0) return null;
    return {
      price_per_1m_tokens: monthlyPrice(plan) / ((credits * perCredit) / 1_000_000),
      estimated_tokens_millions: (credits * perCredit) / 1_000_000,
      confidence: "low"
    };
  }

  return null;
}

export function normalizePlan(rawPlan, seed, officialModel, { checkedAt, fx, stale = false }) {
  const seedPlan = seed.plans.find((item) => item.id === rawPlan.id);
  if (!seedPlan) return null;
  const monthly = monthlyPrice(rawPlan);
  const calculated = estimate(rawPlan, seed, officialModel);
  const monthlyCny = monthly == null ? null : rawPlan.currency === "CNY" ? monthly : rawPlan.currency === "USD" && fx?.usd_cny ? monthly * fx.usd_cny : null;
  const estimateCny =
    calculated?.price_per_1m_tokens == null
      ? null
      : rawPlan.currency === "CNY"
        ? calculated.price_per_1m_tokens
        : rawPlan.currency === "USD" && fx?.usd_cny
          ? calculated.price_per_1m_tokens * fx.usd_cny
          : null;
  const usageMultiplier =
    rawPlan.model_usage?.amount != null && monthly != null && monthly > 0
      ? rawPlan.model_usage.amount / monthly
      : null;

  return {
    id: rawPlan.id,
    vendor: rawPlan.vendor,
    vendor_id: rawPlan.vendor_id,
    name: rawPlan.name,
    kind: seedPlan.kind,
    tags: seedPlan.tags ?? [],
    currency: rawPlan.currency,
    price: monthly,
    price_period: rawPlan.price_period,
    billing_option: rawPlan.billing_option ?? null,
    list_price: rawPlan.list_price ?? null,
    annual_price: rawPlan.annual_price ?? null,
    per: rawPlan.per ?? "account",
    included_usage: rawPlan.included_usage ?? null,
    model_usage: rawPlan.model_usage ?? null,
    usage_windows: rawPlan.usage_windows ?? null,
    usage_value_multiplier: usageMultiplier == null ? null : round(usageMultiplier, 3),
    estimated_tokens_millions: calculated?.estimated_tokens_millions == null ? null : round(calculated.estimated_tokens_millions, 2),
    price_per_1m_tokens: calculated?.price_per_1m_tokens == null ? null : round(calculated.price_per_1m_tokens, 6),
    price_per_1m_tokens_cny: estimateCny == null ? null : round(estimateCny, 6),
    monthly_price_cny: monthlyCny == null ? null : round(monthlyCny, 2),
    confidence: calculated?.confidence ?? null,
    method: rawPlan.method ?? null,
    available: rawPlan.available !== false,
    notes: seedPlan.notes ?? rawPlan.notes ?? null,
    source_url: rawPlan.source_url ?? seedPlan.source_url ?? null,
    verified_at: rawPlan.verified_at ?? checkedAt,
    stale,
    source_id: rawPlan.source_id ?? seedPlan.source_id
  };
}
