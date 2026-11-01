# Contributing

## Report a price change

Open a price correction issue with:

1. Platform and plan name.
2. Current public page URL.
3. Exact price and quota text.
4. Date you saw it.

Do not paste screenshots only; use text so the parser can be checked.

## Add or update a parser

1. Add the source to `scripts/lib/sources/`.
2. Add plan metadata to `data/plans.seed.json`.
3. Add the source to `sourceConfigs` in `scripts/update-prices.mjs`.
4. Add a small HTML fixture and a `node:test` case in `tests/`.
5. Run `npm run check`.

## Parser rules

- Prefer parsing a table over scraping prose.
- Throw when an expected field is missing; do not default to yesterday's value.
- Keep the original currency and quota unit.
- Mark any conversion as an assumption.
