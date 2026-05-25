import cron from "node-cron";
import { Product } from "../models/Product";
import { logger } from "./logger";

cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  await Product.updateMany(
    { "discount.endDate": { $lte: now } },
    { $unset: { discount: 1 } }
  );
  logger.info("Expired discounts removed successfully.");
});