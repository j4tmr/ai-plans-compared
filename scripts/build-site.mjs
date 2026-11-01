import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  renderFeed,
  renderIndex,
  renderLlms,
  renderManifest,
  renderRobots,
  renderSitemap
} from "./lib/render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const dataPath = path.join(root, "data/pricing.json");
const configPath = path.join(root, "site.config.json");

const document = JSON.parse(await readFile(dataPath, "utf8"));
const config = JSON.parse(await readFile(configPath, "utf8"));

function resolveOrigin() {
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN.replace(/\/$/, "");
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    return `https://${owner}.github.io/${repo}`;
  }
  return config.origin.replace(/\/$/, "");
}

// Affiliate invite code comes from a GitHub Actions secret at deploy time.
// Referral codes are meant to be public on the page, but keeping them out of
// the repo source avoids stale copies when the code rotates.
function resolveWorkBuddyUrl() {
  const code = (process.env.WORKBUDDY_INVITE_CODE ?? "").trim();
  if (/^[A-Za-z0-9_-]{4,64}$/.test(code)) {
    return `https://www.workbuddy.cn/events/invite?inviteCode=${encodeURIComponent(code)}`;
  }
  return "https://www.workbuddy.cn/";
}

const origin = resolveOrigin();
const workbuddyUrl = resolveWorkBuddyUrl();
const asOfDate = /^\d{4}-\d{2}-\d{2}/.test(String(document.updated_at ?? ""))
  ? String(document.updated_at).slice(0, 10)
  : undefined;
await mkdir(publicDir, { recursive: true });
await mkdir(path.join(publicDir, "data"), { recursive: true });
await mkdir(path.join(publicDir, "en"), { recursive: true });

await writeFile(path.join(publicDir, "index.html"), renderIndex({ document, config, origin, locale: "zh-CN", workbuddyUrl }));
await writeFile(path.join(publicDir, "en/index.html"), renderIndex({ document, config, origin, locale: "en", workbuddyUrl }));
await writeFile(path.join(publicDir, "data/pricing.json"), `${JSON.stringify(document, null, 2)}\n`);
await writeFile(path.join(publicDir, "sitemap.xml"), renderSitemap(origin, asOfDate));
await writeFile(path.join(publicDir, "feed.xml"), renderFeed(document, origin));
await writeFile(path.join(publicDir, "robots.txt"), renderRobots(origin));
await writeFile(path.join(publicDir, "llms.txt"), renderLlms(document, origin, config));
await writeFile(path.join(publicDir, "manifest.webmanifest"), renderManifest(config));
await writeFile(path.join(publicDir, ".nojekyll"), "");
