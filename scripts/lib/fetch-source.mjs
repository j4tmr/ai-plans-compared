const DEFAULT_HEADERS = {
  "user-agent": "cheapest-deepseek-plan/0.1 (+https://github.com/j4tmr/cheapest-deepseek-plan)",
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8"
};

export async function fetchText(url, { timeoutMs = 15_000 } = {}) {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}
