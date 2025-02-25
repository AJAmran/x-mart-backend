// // utils/cronJobs.ts
// import cron from "node-cron";
// import { Product } from "../models/Product";

// // Run every day at midnight
// cron.schedule("0 0 * * *", async () => {
//   const now = new Date();
//   await Product.updateMany(
//     { "discount.endDate": { $lte: now } },
//     { $unset: { discount: 1 } }
//   );
//   console.log("Expired discounts removed successfully.");
// });