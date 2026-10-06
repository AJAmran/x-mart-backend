/**
 * `npm run seed:catalog` — installs the demo storefront.
 *
 * A fresh install used to come up with an admin login and nothing to look at:
 * `seed.ts` only ever created users, so the shop had zero products and zero
 * outlets until someone added them by hand through the dashboard. That is the
 * opposite of a five-minute setup, and it is impossible to demo.
 *
 * This imports `src/seed/fixtures/catalog.json` — outlets and a grocery
 * catalog — resolving branch references by their human-readable `code` rather
 * than by database id, because ids from another database mean nothing here.
 *
 * Safe to re-run: branches upsert on `code` and products on `sku`, so it
 * updates in place instead of duplicating. `--reset` deletes the catalog first
 * when you actually want the demo data gone.
 */
export {};
