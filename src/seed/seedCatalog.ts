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

import mongoose from "mongoose";
import { existsSync, readFileSync } from "fs";
import path from "path";

import config from "../config";
import { Branch } from "../models/Branch";
import { Product } from "../models/Product";
import { logger } from "../utils/logger";

type FixtureBranch = {
  name: string;
  code: string;
  status: string;
  type: string;
  contact: Record<string, unknown>;
  location: Record<string, unknown>;
  operatingHours: Record<string, unknown>[];
  facilities?: Record<string, unknown>;
  openingDate: string;
  description?: string;
  images?: string[];
  size?: number;
  employeeCount?: number;
};

type FixtureProduct = {
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  category: string;
  subCategory?: string;
  status: string;
  images: string[];
  availability: string;
  operationType: string;
  tags: string[];
  sku: string;
  weight?: number;
  dimensions?: Record<string, number>;
  manufacturer?: string;
  supplier?: string;
  barcode?: string;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    startDate: string | null;
    endDate: string | null;
  };
  inventories: { stock: number; lowStockThreshold?: number; branchCode: string | null }[];
  availableBranchCodes: (string | undefined)[];
};

const log = logger.child({ script: "seed:catalog" });

/**
 * Locate the catalog fixture.
 *
 * It has to work in two layouts: running from source via tsx during
 * development (`src/seed/fixtures/`), and running the compiled output inside
 * the Docker image (`dist/seed/seedCatalog.js` with fixtures copied alongside).
 */
function resolveFixturePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "src/seed/fixtures/catalog.json"),
    path.resolve(process.cwd(), "fixtures/catalog.json"),
    path.resolve(__dirname, "../fixtures/catalog.json"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(
    `catalog.json not found. Looked in:\n  ${candidates.join("\n  ")}`
  );
}

async function seedCatalog(): Promise<void> {
  const fixturePath = resolveFixturePath();

  const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
    branches: FixtureBranch[];
    products: FixtureProduct[];
  };

  const reset = process.argv.includes("--reset");

  await mongoose.connect(config.mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    autoIndex: false,
  } as mongoose.ConnectOptions);

  if (reset) {
    const { deletedCount: products } = await Product.deleteMany({});
    const { deletedCount: branches } = await Branch.deleteMany({});

    log.warn({ products, branches }, "existing catalog deleted (--reset)");
  }

  // ── Branches, keyed by code ────────────────────────────────────────────────
  const branchIdByCode = new Map<string, mongoose.Types.ObjectId>();

  for (const branch of fixture.branches) {
    const doc = await Branch.findOneAndUpdate(
      { code: branch.code },
      { $set: { ...branch, openingDate: new Date(branch.openingDate) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    branchIdByCode.set(branch.code, doc._id);
  }

  log.info(
    { count: branchIdByCode.size },
    "branches ready (outlets / branches)"
  );

  // ── Products, keyed by sku ────────────────────────────────────────────────
  let created = 0;
  let updated = 0;
  const unresolved: string[] = [];

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
      .filter((inv): inv is NonNullable<typeof inv> => inv !== null);

    const availableBranches = availableBranchCodes
      .map((code) => (code ? branchIdByCode.get(code) : undefined))
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

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

    const existed = await Product.exists({ sku: product.sku });

    await Product.findOneAndUpdate(
      { sku: product.sku },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (existed) updated += 1;
    else created += 1;
  }

  log.info({ created, updated, total: fixture.products.length }, "products ready");

  if (unresolved.length) {
    log.warn(
      { refs: unresolved },
      "some stock entries referenced an unknown branch and were skipped"
    );
  }

  const branches = await Branch.countDocuments();
  const products = await Product.countDocuments();

  log.info(
    { branches, products },
    "catalog seeded — the storefront is ready to browse"
  );
}

seedCatalog()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    log.error({ err: error }, "catalog seed failed");
    await mongoose.disconnect();
    process.exit(1);
  });