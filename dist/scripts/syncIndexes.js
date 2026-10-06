"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../utils/logger");
const Branch_1 = require("../models/Branch");
const Cart_1 = require("../models/Cart");
const Order_1 = require("../models/Order");
const Payment_1 = require("../models/Payment");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const log = logger_1.logger.child({ script: "sync:indexes" });
async function syncIndexes() {
    await mongoose_1.default.connect(config_1.default.mongoUri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 60000,
        autoIndex: false,
    });
    const failures = [];
    for (const model of [Branch_1.Branch, Cart_1.Cart, Order_1.Order, Payment_1.Payment, Product_1.Product, User_1.User]) {
        try {
            // Awaited rather than fire-and-forget: the process disconnects on exit,
            // and an un-awaited build fails with "Client must be connected".
            await model.createIndexes();
            log.info({ model: model.modelName }, "indexes ensured");
        }
        catch (error) {
            failures.push(model.modelName);
            log.error({ err: error, model: model.modelName }, "index creation failed");
        }
    }
    await mongoose_1.default.disconnect();
    if (failures.length) {
        // Almost always duplicate values in the data (e.g. two accounts sharing a
        // phone number) rather than a permissions problem, so say so.
        log.error({ models: failures }, "some indexes were not created — usually duplicate values in existing data");
        process.exit(1);
    }
}
syncIndexes()
    .then(() => process.exit(0))
    .catch((error) => {
    log.error({ err: error }, "index sync failed");
    process.exit(1);
});
//# sourceMappingURL=syncIndexes.js.map