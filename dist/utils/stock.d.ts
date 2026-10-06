import type { TInventory } from "../interface/productInterface";
/**
 * Resolves the sellable stock for a product.
 *
 * `Product.inventories` (one entry per branch) is the source of truth.
 * The top-level `stock` field is a denormalised convenience copy, and it has
 * historically drifted in two damaging ways:
 *
 *  1. Order placement used to run `$inc: { stock: -qty }` against the field.
 *     On a document where `stock` was missing or 0 that *creates* the field
 *     with a negative value, and Mongoose validators do not run on
 *     `findOneAndUpdate` unless `runValidators` is set — so `min: 0` never
 *     caught it.
 *  2. Readers then did `product.stock ?? 0 || inventoriesSum`. Because a
 *     negative number is truthy, the fallback never fired and every read
 *     returned the negative value.
 *
 * Together those made a product permanently unorderable and permanently show
 * as "Out of stock" after a single successful sale — with no way to recover
 * except a manual database edit.
 *
 * This helper makes the branch inventories authoritative and treats the
 * top-level copy as trustworthy only when it is a real, non-negative number.
 * Prefer it over reading `product.stock` directly, anywhere stock matters.
 */
export declare const resolveProductStock: (product?: {
    stock?: number | null;
    inventories?: TInventory[] | null;
}) => number;
