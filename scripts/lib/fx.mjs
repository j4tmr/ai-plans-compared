import { fetchText } from "./fetch-source.mjs";

const endpoints = [
  {
    source: "https://api.frankfurter.app/latest?from=USD&to=CNY",
    read: async (url) => {
      const payload = JSON.parse(await fetchText(url, { timeoutMs: 8_000 }));
      const rate = payload?.rates?.CNY;
      if (!Number.isFinite(rate)) throw new Error("Frankfurter response has no CNY rate");
      return { usd_cny: rate, source: url, as_of: payload.date ?? null };
    }
  },
  {
    source: "https://open.er-api.com/v6/latest/USD",
    read: async (url) => {
      const payload = JSON.parse(await fetchText(url, { timeoutMs: 8_000 }));
      const rate = payload?.rates?.CNY;
      if (!Number.isFinite(rate)) throw new Error("ER-API response has no CNY rate");
      return { usd_cny: rate, source: url, as_of: payload.time_last_update_utc ?? null };
    }
  }
];

export async function fetchUsdCny() {
  let lastError = new Error("No FX endpoint configured");
  for (const endpoint of endpoints) {
    try {
      return await endpoint.read(endpoint.source);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
