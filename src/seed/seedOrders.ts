/**
 * Historical demo orders.
 *
 * The base seed only creates users, so orders ended up clustered on the day
 * they were created. That left the dashboard's 7-day revenue/order-volume
 * charts with a single spike and five empty days, and gave the sales-analytics
 * pages nothing to trend.
 *
 * This spreads realistic orders across the last N days (default 30) so those
 * views show an actual trend.
 *
 * Usage:
 *   npm run seed:orders              # 60 orders over the last 30 days
 *   npm run seed:orders -- --count=120 --days=60
 *   npm run seed:orders -- --reset   # delete previously seeded demo orders first
 *
 * Idempotent: every generated order carries a `seed:demo:<n>` idempotencyKey,
 * so re-running skips whatever already exists instead of duplicating it.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import config from "../config";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { USER_ROLE } from "../constants/userConstant";
import { logger } from "../utils/logger";

const SEED_PREFIX = "seed:demo:";

/**
 * `timestamps: false` keeps the historical createdAt/updatedAt we generate
 * instead of Mongoose stamping every row with "now". The flag is honoured at
 * runtime but missing from `InsertManyOptions`, hence the cast.
 */
const PRESERVE_DATES = {
  timestamps: false,
  ordered: false,
} as unknown as mongoose.InsertManyOptions;

/* ── CLI ──────────────────────────────────────────────────────────────────── */

const arg = (name: string, fallback: number): number => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));

  return hit ? Number(hit.split("=")[1]) : fallback;
};

const COUNT = Math.max(0, arg("count", 60));
const DAYS = Math.max(1, arg("days", 30));
const RESET = process.argv.includes("--reset");

/* ── Fixtures ─────────────────────────────────────────────────────────────── */

const CITIES: Record<string, { line: string; city: string; postal: string; division: string }> = {
  dhaka: { line: "House 42, Road 11, Banani", city: "Dhaka", postal: "1213", division: "Dhaka" },
  gulshan: { line: "Flat 5B, House 7, Road 8, Gulshan", city: "Dhaka", postal: "1212", division: "Dhaka" },
  dhanmondi: { line: "House 15, Road 2, Dhanmondi", city: "Dhaka", postal: "1209", division: "Dhaka" },
  chittagong: { line: "House 21, Road 5, Agrabad", city: "Chattogram", postal: "4100", division: "Chattogram" },
  sylhet: { line: "House 9, Zindabazar Road", city: "Sylhet", postal: "3100", division: "Sylhet" },
  khulna: { line: "House 33, Sonadanga", city: "Khulna", postal: "9100", division: "Khulna" },
};

/** Canonical `01XXXXXXXXX`, derived from the account's `+8801…` or `01…` mobile. */
const toCanonicalPhone = (mobile: string): string => {
  // Anchored at both ends: without `^` a malformed number could match from a
  // later offset and yield a silently wrong phone on the order.
  const match = /^(?:\+?8801|01)(\d{9})$/.exec(mobile.replace(/[\s\-()]/g, ""));

  return match ? `01${match[1]}` : "01700000000";
};

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]!;

const randInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

/* ── Status lifecycle ─────────────────────────────────────────────────────── */

const FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

/**
 * Older orders have had time to complete, so they skew DELIVERED; recent ones
 * are still moving through the flow. A small share is cancelled.
 */
const statusForAge = (ageDays: number): string => {
  if (ageDays >= 6) {
    const r = Math.random();

    if (r < 0.88) return "DELIVERED";
    if (r < 0.95) return "CANCELLED";

    return "SHIPPED";
  }

  if (ageDays >= 3) {
    const r = Math.random();

    if (r < 0.5) return "DELIVERED";
    if (r < 0.75) return "SHIPPED";
    if (r < 0.9) return "PROCESSING";

    return "CANCELLED";
  }

  if (ageDays >= 1) {
    const r = Math.random();

    if (r < 0.3) return "DELIVERED";
    if (r < 0.6) return "SHIPPED";
    if (r < 0.85) return "PROCESSING";

    return "PENDING";
  }

  const r = Math.random();

  if (r < 0.45) return "PENDING";
  if (r < 0.7) return "PROCESSING";
  if (r < 0.9) return "SHIPPED";

  return "DELIVERED";
};

/** Timestamps walking the flow forward from the order date. */
const buildHistory = (
  placedAt: Date,
  status: string,
  paymentMethod: string
): { status: string; updatedAt: Date; note?: string }[] => {
  const history = [
    {
      status: "PENDING",
      updatedAt: placedAt,
      note: paymentMethod === "ONLINE" ? "Awaiting payment" : "Order placed",
    },
  ];

  if (status === "PENDING") return history;

  const reached =
    status === "CANCELLED"
      ? ["PROCESSING"]
      : FLOW.slice(0, FLOW.indexOf(status as (typeof FLOW)[number]) + 1);

  reached.forEach((step, i) => {
    if (step === "PENDING") return;

    history.push({
      status: step,
      updatedAt: new Date(placedAt.getTime() + (i + 1) * randInt(4, 40) * 3_600_000),
      note:
        step === "DELIVERED"
          ? "Delivered to customer"
          : step === "SHIPPED"
            ? "Handed to courier"
            : "Packed and ready",
    });
  });

  if (status === "CANCELLED") {
    history.push({
      status: "CANCELLED",
      updatedAt: new Date(placedAt.getTime() + randInt(6, 50) * 3_600_000),
      note: "Cancelled at customer request",
    });
  }

  return history;
};

/* ── Generation ───────────────────────────────────────────────────────────── */

/** Weighted so recent days are busier, which reads like a growing store. */
const randomAgeDays = (): number => {
  const weights: number[] = [];

  for (let d = 0; d < DAYS; d += 1) weights.push(1 + (DAYS - d) * 0.12);

  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (let d = 0; d < weights.length; d += 1) {
    roll -= weights[d]!;

    if (roll <= 0) return d;
  }

  return 0;
};

const buildOrders = (users: any[], products: any[]) => {
  const docs: any[] = [];

  for (let i = 0; i < COUNT; i += 1) {
    const user = pick(users);
    const ageDays = randomAgeDays();
    const placedAt = new Date(Date.now() - ageDays * 86_400_000);
    placedAt.setHours(randInt(8, 22), randInt(0, 59), randInt(0, 59), 0);

    // Never let the future slip in: a 0-day-old order can land after "now".
    if (placedAt.getTime() > Date.now()) placedAt.setTime(Date.now() - randInt(5, 90) * 60_000);

    const itemCount = randInt(1, 3);
    const chosen = new Set<string>();
    const items = [];

    while (items.length < itemCount) {
      const product = pick(products);

      if (chosen.has(String(product._id))) continue;
      chosen.add(String(product._id));

      items.push({
        productId: product._id,
        quantity: randInt(1, 3),
        price: product.price,
        name: product.name,
        image: product.images?.[0] ?? "https://placehold.co/400x400?text=x-mart",
      });
    }

    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const status = statusForAge(ageDays);

    // Older orders skew cash on delivery; online payment is more common recently.
    const paymentMethod =
      Math.random() < (ageDays <= 2 ? 0.45 : 0.25) ? "ONLINE" : "CASH_ON_DELIVERY";

    const place = pick(Object.values(CITIES));

    docs.push({
      userId: user._id,
      items,
      shippingInfo: {
        name: user.name,
        email: user.email,
        addressLine1: place.line,
        addressLine2: "",
        city: place.city,
        postalCode: place.postal,
        division: place.division,
        // Canonical form, matching what the order API now normalises to.
        phone: toCanonicalPhone(user.mobileNumber ?? ""),
      },
      totalPrice,
      status,
      paymentMethod,
      /**
       * Deliberately false. These are historical rows inserted straight into
       * the database — product stock was never decremented for them, so a
       * later cancellation must not credit stock back. Setting it true would
       * inflate stock every time one of these demo orders is cancelled.
       */
      stockDeducted: false,
      idempotencyKey: `${SEED_PREFIX}${i}`,
      trackingHistory: buildHistory(placedAt, status, paymentMethod),
      createdAt: placedAt,
      updatedAt: new Date(
        placedAt.getTime() + randInt(1, 72) * 3_600_000
      ),
    });
  }

  return docs;
};

/* ── Run ──────────────────────────────────────────────────────────────────── */

const reset = async () => {
  const { deletedCount } = await Order.deleteMany({
    idempotencyKey: { $regex: `^${SEED_PREFIX}` },
  });

  await Payment.deleteMany({ tranId: { $regex: "^SEED-" } });
  logger.info({ deletedCount }, "Removed previously seeded demo orders");
};

const run = async () => {
  const start = performance.now();

  await mongoose.connect(config.mongoUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    autoIndex: false,
  } as mongoose.ConnectOptions);

  logger.info("Connected to database for order seeding");

  if (RESET) await reset();

  const users = await User.find({ role: USER_ROLE.USER }).lean();
  // Product documents store the enum *key* (`"ACTIVE"`), not the constant's
  // value (`"active"`) — `PRODUCT_STATUS.ACTIVE === "active"`, but the schema
  // and every existing query use the key. Same for `USER_ROLE` below.
  const products = await Product.find({ status: "ACTIVE" }).lean();

  if (users.length === 0 || products.length === 0) {
    throw new Error("Seed users and products first (npm run seed)");
  }

  const existing = new Set(
    await Order.find({ idempotencyKey: { $regex: `^${SEED_PREFIX}` } })
      .distinct("idempotencyKey")
  );

  const docs = buildOrders(users, products).filter(
    (o) => !existing.has(o.idempotencyKey)
  );

  if (docs.length === 0) {
    logger.info(
      { requested: COUNT },
      "All demo orders already seeded — pass --reset to recreate them"
    );
  } else {
    const inserted = (await Order.insertMany(docs, PRESERVE_DATES)) as unknown as any[];

    logger.info({ inserted: inserted.length }, "Demo orders seeded");

    // Give the ONLINE orders a payment record so the payments views and the
    // order detail page are consistent with the order list.
    const payments = inserted
      .filter((o: any) => o.paymentMethod === "ONLINE")
      .map((o: any) => ({
        orderId: o._id,
        userId: o.userId,
        tranId: `SEED-${String(o._id).slice(-10).toUpperCase()}`,
        amount: o.totalPrice,
        status:
          o.status === "PENDING" ? "INITIATED" : o.status === "CANCELLED" ? "CANCELLED" : "SUCCESS",
        paymentMethod: "sslcommerz",
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }));

    if (payments.length) {
      await Payment.insertMany(payments, PRESERVE_DATES);
      logger.info({ inserted: payments.length }, "Demo payments seeded");
    }
  }

  const total = await Order.countDocuments({});
  const window = await Order.countDocuments({
    createdAt: { $gte: new Date(Date.now() - DAYS * 86_400_000) },
  });

  logger.info(
    { total, withinWindow: window, days: DAYS },
    `Orders now: ${total} total, ${window} in the last ${DAYS} days`
  );

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  logger.info({ elapsed: `${elapsed}s` }, "Order seeding complete");

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "Order seeding failed");
    process.exit(1);
  });