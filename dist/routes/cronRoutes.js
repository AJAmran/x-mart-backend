"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
/**
 * GET /api/v1/cron/cleanup-discounts
 *
 * Vercel Cron triggers this daily at 00:00 UTC (see vercel.json).
 * Path alignment: previously mounted at /api/cron, now mounted at /api/v1/cron
 * to keep the entire public surface under one versioned namespace.
 *
 * Security: the CRON_SECRET is REQUIRED. Vercel injects it as
 *   Authorization: Bearer ${CRON_SECRET}
 * An empty secret causes the route to refuse every request (deny-by-default).
 */
router.get("/cleanup-discounts", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    // C-08 FIX: deny by default. Previously the check was bypassed when
    // CRON_SECRET was unset, leaving the route fully public.
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const now = new Date();
        const result = await Product_1.Product.updateMany({ "discount.endDate": { $lte: now } }, { $unset: { discount: 1 } });
        logger_1.logger.info({ modified: result.modifiedCount }, "Cron: expired discounts removed");
        return res.status(200).json({
            success: true,
            message: "Expired discounts cleaned up",
            modifiedCount: result.modifiedCount,
        });
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "Cron cleanup failed");
        return res.status(500).json({ success: false, message: "Cleanup failed" });
    }
});
exports.default = router;
//# sourceMappingURL=cronRoutes.js.map