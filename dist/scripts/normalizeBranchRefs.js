"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Normalise product branch references to ObjectId.
 *
 * `Product.inventories.branchId` and `Product.availableBranches` are declared as
 * `Schema.Types.ObjectId` (with `ref: "Branch"`), but the seeded documents hold
 * them as BSON **strings**. Mongoose casts query values to the schema type, so
 * every query that compared a branch id silently matched nothing:
 *
 *  - `PATCH /products/:id/update-stock`  → always 404 "Product not found"
 *  - `GET /products?branchId=…`          → always an empty page
 *  - `GET /branches/:id/products`        → only `ALL_BRANCHES` products
 *
 * This script rewrites those string values as real ObjectIds so the stored data
 * matches the schema. Serialisation is unchanged (an ObjectId still renders as
 * its hex string), so no client sees a difference.
 *
 * Idempotent: documents that already hold ObjectIds are skipped, so it is safe
 * to re-run after re-seeding.
 *
 * Usage: `npm run migrate:branch-refs`
 */
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const Product_1 = require("../models/Product");
const HEX24 = /^[0-9a-fA-F]{24}$/;
const isUncastable = (value) => value !== null &&
    value !== undefined &&
    !(value instanceof mongoose_1.default.Types.ObjectId) &&
    !(typeof value === "string" && HEX24.test(value));
const toObjectId = (value) => {
    if (value instanceof mongoose_1.default.Types.ObjectId)
        return value;
    if (typeof value !== "string" || !HEX24.test(value))
        return null;
    return new mongoose_1.default.Types.ObjectId(value);
};
const run = async () => {
    await mongoose_1.default.connect(config_1.default.mongoUri);
    console.log("Connected.");
    const products = await Product_1.Product.collection.find({}).toArray();
    let fixedProducts = 0;
    let fixedInventories = 0;
    let fixedAvailableBranches = 0;
    const uncastable = new Set();
    for (const doc of products) {
        const set = {};
        // --- inventories[].branchId ---
        const inventories = Array.isArray(doc.inventories)
            ? doc.inventories
            : [];
        let inventoriesChanged = false;
        const nextInventories = inventories.map((inv) => {
            if (isUncastable(inv.branchId))
                uncastable.add(`inventories: ${String(inv.branchId)}`);
            const oid = toObjectId(inv.branchId);
            if (!oid || inv.branchId instanceof mongoose_1.default.Types.ObjectId)
                return inv;
            inventoriesChanged = true;
            fixedInventories += 1;
            return { ...inv, branchId: oid };
        });
        if (inventoriesChanged)
            set.inventories = nextInventories;
        // --- availableBranches ---
        const availableBranches = Array.isArray(doc.availableBranches)
            ? doc.availableBranches
            : [];
        let availableChanged = false;
        const nextAvailable = availableBranches.map((branch) => {
            if (isUncastable(branch))
                uncastable.add(`availableBranches: ${String(branch)}`);
            const oid = toObjectId(branch);
            if (!oid || branch instanceof mongoose_1.default.Types.ObjectId)
                return branch;
            availableChanged = true;
            fixedAvailableBranches += 1;
            return oid;
        });
        if (availableChanged)
            set.availableBranches = nextAvailable;
        if (inventoriesChanged || availableChanged) {
            await Product_1.Product.collection.updateOne({ _id: doc._id }, { $set: set });
            fixedProducts += 1;
        }
    }
    console.log(`products updated:            ${fixedProducts}`);
    console.log(`inventories.branchId fixed:  ${fixedInventories}`);
    console.log(`availableBranches fixed:     ${fixedAvailableBranches}`);
    if (uncastable.size) {
        console.warn(`WARNING: left ${uncastable.size} uncastable value(s) unchanged:`);
        for (const value of uncastable)
            console.warn(`  ${value}`);
    }
    const remaining = await Product_1.Product.collection.countDocuments({
        $or: [
            { "inventories.branchId": { $type: "string" } },
            { "availableBranches": { $type: "string" } },
        ],
    });
    console.log(remaining === 0
        ? "Verified: no string branch references remain."
        : `Verified: ${remaining} document(s) still hold string refs.`);
    await mongoose_1.default.disconnect();
};
run()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=normalizeBranchRefs.js.map