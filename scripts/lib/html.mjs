import * as cheerio from "cheerio";

export const loadHtml = (html) => cheerio.load(html);

export const text = ($, node) => $(node).text().replace(/\s+/g, " ").trim();

export function tableRows($, table) {
  if (!table || table.length === 0) return [];
  return [...table.find("tr")].map((row) => [...$(row).find("th,td")].map((cell) => text($, cell)));
}

export function findTable($, predicate) {
  const found = $("table").toArray().find((table) => predicate(tableRows($, $(table))));
  return found ? $(found) : null;
}

export const compact = (value) => value.replace(/\s+/g, " ").trim();
