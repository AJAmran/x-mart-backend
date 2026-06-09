import express, { Request, Response } from "express";
import { Product } from "../models/Product";
import { logger } from "../utils/logger";

const router = express.Router();

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
router.get("/cleanup-discounts", async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  // C-08 FIX: deny by default. Previously the check was bypassed when
  // CRON_SECRET was unset, leaving the route fully public.
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const now = new Date();
    const result = await Product.updateMany(
      { "discount.endDate": { $lte: now } },
      { $unset: { discount: 1 } }
    );

    logger.info(
      { modified: result.modifiedCount },
      "Cron: expired discounts removed"
    );

    return res.status(200).json({
      success: true,
      message: "Expired discounts cleaned up",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error({ err: error }, "Cron cleanup failed");
    return res.status(500).json({ success: false, message: "Cleanup failed" });
  }
});

export default router;
