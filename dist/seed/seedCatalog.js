"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const Branch_1 = require("../models/Branch");
const Product_1 = require("../models/Product");
const logger_1 = require("../utils/logger");
const log = logger_1.logger.child({ script: "seed:catalog" });
/**
 * Locate the catalog fixture.
 *
 * It has to work in two layouts: running from source via tsx during
 * development (`src/seed/fixtures/`), and running the compiled output inside
 * the Docker image (`dist/seed/seedCatalog.js` with fixtures copied alongside).
 */
function resolveFixturePath() {
    const candidates = [
        path_1.default.resolve(process.cwd(), "src/seed/fixtures/catalog.json"),
        path_1.default.resolve(process.cwd(), "fixtures/catalog.json"),
        path_1.default.resolve(__dirname, "../fixtures/catalog.json"),
    ];
    for (const candidate of candidates) {
        if ((0, fs_1.existsSync)(candidate))
            return candidate;
    }
    throw new Error(`catalog.json not found. Looked in:\n  ${candidates.join("\n  ")}`);
}
async function seedCatalog() {
    const fixturePath = resolveFixturePath();
    const fixture = JSON.parse((0, fs_1.readFileSync)(fixturePath, "utf8"));
    const reset = process.argv.includes("--reset");
    await mongoose_1.default.connect(config_1.default.mongoUri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        autoIndex: false,
    });
    if (reset) {
        const { deletedCount: products } = await Product_1.Product.deleteMany({});
        const { deletedCount: branches } = await Branch_1.Branch.deleteMany({});
        log.warn({ products, branches }, "existing catalog deleted (--reset)");
    }
    // ── Branches, keyed by code ────────────────────────────────────────────────
    const branchIdByCode = new Map();
    for (const branch of fixture.branches) {
        const doc = await Branch_1.Branch.findOneAndUpdate({ code: branch.code }, { $set: { ...branch, openingDate: new Date(branch.openingDate) } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
        branchIdByCode.set(branch.code, doc._id);
    }
    log.info({ count: branchIdByCode.size }, "branches ready (outlets / branches)");
    // ── Products, keyed by sku ────────────────────────────────────────────────
    let created = 0;
    let updated = 0;
    const unresolved = [];
    for (const product of fixture.products) {
        const { inventories, availableBranchCodes, discount, ...rest } = product;
        // Resolve the fixture's branch codes back into this database's ids.
        const resolvedInventories = inventories
            .map((inv) => {
            const branchId = inv.branchCode
                ? branchIdByCode.get(inv.branchCode)
                : undefined;
            if (!branchId) {
                unresolved.push(`${product.sku} -> ${inv.branchCode ?? "(none)"}`);
                return null;
            }
            return {
                stock: inv.stock,
                lowStockThreshold: inv.lowStockThreshold ?? 5,
                branchId,
            };
        })
            .filter((inv) => inv !== null);
        const availableBranches = availableBranchCodes
            .map((code) => (code ? branchIdByCode.get(code) : undefined))
            .filter((id) => Boolean(id));
        // `stock` is denormalised at the top level as well as per branch; keep the
        // two in agreement or the storefront shows "in stock" for an item that is
        // not actually purchasable.
        const totalStock = resolvedInventories.reduce((sum, inv) => sum + inv.stock, 0);
        const update = {
            ...rest,
            stock: totalStock,
            inventories: resolvedInventories,
            availableBranches,
            ...(discount
                ? {
                    discount: {
                        type: discount.type,
                        value: discount.value,
                        startDate: discount.startDate ? new Date(discount.startDate) : undefined,
                        endDate: discount.endDate ? new Date(discount.endDate) : undefined,
                        applicableBranches: availableBranches,
                    },
                }
                : {}),
        };
        const existed = await Product_1.Product.exists({ sku: product.sku });
        await Product_1.Product.findOneAndUpdate({ sku: product.sku }, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true });
        if (existed)
            updated += 1;
        else
            created += 1;
    }
    log.info({ created, updated, total: fixture.products.length }, "products ready");
    if (unresolved.length) {
        log.warn({ refs: unresolved }, "some stock entries referenced an unknown branch and were skipped");
    }
    const branches = await Branch_1.Branch.countDocuments();
    const products = await Product_1.Product.countDocuments();
    log.info({ branches, products }, "catalog seeded — the storefront is ready to browse");
}
seedCatalog()
    .then(async () => {
    await mongoose_1.default.disconnect();
    process.exit(0);
})
    .catch(async (error) => {
    log.error({ err: error }, "catalog seed failed");
    await mongoose_1.default.disconnect();
    process.exit(1);
});
//# sourceMappingURL=seedCatalog.js.map