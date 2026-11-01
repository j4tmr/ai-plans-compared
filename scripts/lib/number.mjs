const FULLWIDTH_COMMA = /[,，]/g;

export function toNumber(value) {
  if (typeof value !== "string") return null;
  const raw = value.replace(FULLWIDTH_COMMA, "").trim();
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export const round = (value, digits = 4) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const balancedRate = (pricing) => (pricing.input + pricing.output) / 2;
