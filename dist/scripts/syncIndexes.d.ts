/**
 * `npm run sync:indexes` — create the declared indexes.
 *
 * `autoIndex` is disabled when NODE_ENV=production (building indexes on boot
 * hammers the database and can lock a large collection). The trade-off is that
 * a brand-new production database has *no* indexes — including the unique
 * constraints on `Product.sku`, `User.email` and `Branch.code`. Without them the
 * catalogue happily accepts duplicate SKUs and duplicate phone numbers.
 *
 * Mongoose's own `syncIndexes()` also *drops* indexes it does not know about,
 * which is wrong for a shared Atlas cluster where another application may own
 * collections in the same database. `createIndexes()` only adds what is missing,
 * so it is safe to run on every deploy.
 */
export {};
