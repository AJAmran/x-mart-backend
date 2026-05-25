"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Product_1 = require("../models/Product");
const logger_1 = require("./logger");
node_cron_1.default.schedule("0 0 * * *", async () => {
    const now = new Date();
    await Product_1.Product.updateMany({ "discount.endDate": { $lte: now } }, { $unset: { discount: 1 } });
    logger_1.logger.info("Expired discounts removed successfully.");
});
//# sourceMappingURL=cronJobs.js.map