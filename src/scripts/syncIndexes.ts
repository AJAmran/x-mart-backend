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

import mongoose from "mongoose";

import config from "../config";
import { logger } from "../utils/logger";
import { Branch } from "../models/Branch";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { Product } from "../models/Product";
import { User } from "../models/User";

const log = logger.child({ script: "sync:indexes" });

async function syncIndexes(): Promise<void> {
  await mongoose.connect(config.mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 60000,
    autoIndex: false,
  } as mongoose.ConnectOptions);

  const failures: string[] = [];

  for (const model of [Branch, Cart, Order, Payment, Product, User]) {
    try {
      // Awaited rather than fire-and-forget: the process disconnects on exit,
      // and an un-awaited build fails with "Client must be connected".
      await model.createIndexes();
      log.info({ model: model.modelName }, "indexes ensured");
    } catch (error) {
      failures.push(model.modelName);
      log.error({ err: error, model: model.modelName }, "index creation failed");
    }
  }

  await mongoose.disconnect();

  if (failures.length) {
    // Almost always duplicate values in the data (e.g. two accounts sharing a
    // phone number) rather than a permissions problem, so say so.
    log.error(
      { models: failures },
      "some indexes were not created — usually duplicate values in existing data"
    );
    process.exit(1);
  }
}

syncIndexes()
  .then(() => process.exit(0))
  .catch((error) => {
    log.error({ err: error }, "index sync failed");
    process.exit(1);
  });