import { loadHtml, compact } from "../html.mjs";
import { toNumber } from "../number.mjs";

export const SOURCE = {
  id: "deepseek",
  vendor: "DeepSeek",
  name: "DeepSeek API 官方定价",
  url: "https://api-docs.deepseek.com/quick_start/pricing/"
};

const price = (text, label) => {
  const match = text.match(new RegExp(`${label}\\s*OFF-PEAK\\s*\\$([\\d.]+)(?:\\s*\\$[\\d.]+)?\\s*PEAK\\s*\\$([\\d.]+)`, "i"));
  if (!match) return null;
  return {
    off_peak: toNumber(match[1]),
    peak: toNumber(match[2])
  };
};

export function parseDeepSeek(html) {
  const $ = loadHtml(html);
  const body = compact($("table").first().text());

  const inputCacheMiss = price(body, "1M INPUT TOKENS\\(CACHE MISS\\)");
  const inputCacheHit = price(body, "1M INPUT TOKENS\\(CACHE HIT\\)");
  const output = price(body, "1M OUTPUT TOKENS");
  if (!inputCacheMiss || !output) {
    throw new Error("DeepSeek official pricing table did not expose the expected off-peak/peak rates");
  }

  const versionMatch = body.match(/DeepSeek-V4\.1-Flash-([0-9]+)/i);
  const contextMatch = body.match(/CONTEXT LENGTH\s*([\d.]+)([KM])/i);
  const outputMatch = body.match(/MAXIMUM:\s*([\d.]+)([KM])/i);
  const peakMatch = body.match(/Peak hours are\s*([0-9:]+\s*-\s*[0-9:]+)\s*and\s*([0-9:]+\s*-\s*[0-9:]+)\s*UTC/i);

  const scale = (amount, unit) => (unit.toUpperCase() === "K" ? amount * 1_000 : amount * 1_000_000);
  const contextWindow = contextMatch ? scale(toNumber(contextMatch[1]), contextMatch[2]) : null;
  const maxOutput = outputMatch ? scale(toNumber(outputMatch[1]), outputMatch[2]) : null;

  return {
    url: SOURCE.url,
    model: {
      id: "deepseek-v4.1-flash",
      official_api_name: "deepseek-flash",
      version: versionMatch ? `DeepSeek-V4.1-Flash-${versionMatch[1]}` : "DeepSeek-V4.1-Flash",
      context_window_tokens: contextWindow,
      max_output_tokens: maxOutput,
      currency: "USD",
      unit: "per_1m_tokens",
      pricing: {
        input_cache_miss: inputCacheMiss,
        input_cache_hit: inputCacheHit,
        output
      },
      peak_windows_utc: peakMatch ? [peakMatch[1], peakMatch[2]] : null
    }
  };
}
