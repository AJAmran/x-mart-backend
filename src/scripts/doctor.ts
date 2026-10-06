/**
 * `npm run doctor` — configuration preflight.
 *
 * Setup pain for a new install is almost never a code problem, it is "one
 * variable is named wrong / missing / left blank" — and the API does not fail
 * until much later, in a way that looks like a bug. For example a blank
 * `Store_Password` only surfaces when a real customer tries to pay.
 *
 * This walks the variables the API actually reads and reports each one as
 * missing, placeholder, or suspicious, with the exact fix. It exits non-zero so
 * it can gate `npm run build` in CI or be the first line of an install script.
 *
 * It intentionally does NOT require the variables that are optional in
 * development (Cloudinary, the live gateway), because failing on those would
 * make local setup hostile.
 */

import { existsSync } from "fs";
import path from "path";

// The API loads .env through src/config, but this script runs before any
// application import, so it has to load it itself or it reports every variable
// as missing on a perfectly good install.
import "dotenv/config";

type Level = "ok" | "warn" | "fail";
type Check = { level: Level; label: string; detail?: string };

const isProd = process.env.NODE_ENV === "production";
const checks: Check[] = [];

const record = (level: Level, label: string, detail?: string) => {
  checks.push({ level, label, detail });
};

const envFilePresent = existsSync(path.resolve(process.cwd(), ".env"));

if (!envFilePresent && !process.env.MONGO_URI) {
  record("fail", ".env file", "not found — copy it: cp .env.example .env");
}

/** Required to boot at all. */
const REQUIRED: Array<[string, string]> = [
  ["MONGO_URI", "Database connection string"],
  ["JWT_SECRET", "Token signing secret"],
  ["JWT_REFRESH_SECRET", "Refresh token secret"],
];

for (const [key, description] of REQUIRED) {
  const value = process.env[key];

  if (!value) {
    record("fail", `${key} (${description})`, "missing or empty");
    continue;
  }

  if (value.length < 32) {
    record(
      "fail",
      `${key} (${description})`,
      `only ${value.length} chars — use node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
    );
    continue;
  }

  record("ok", `${key} (${description})`);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
  record("fail", "JWT_SECRET vs JWT_REFRESH_SECRET", "identical — generate two different secrets");
}

/**
 * Values that were shipped as examples. They work, which is exactly the
 * problem: a store left on demo credentials looks healthy until someone
 * guesses the admin password.
 */
const PLACEHOLDERS = new Set([
  "Admin@123",
  "changeme",
  "your-secret",
  "your_secret",
  "secret",
  "test",
]);

if (process.env.ADMIN_PASSWORD) {
  if (PLACEHOLDERS.has(process.env.ADMIN_PASSWORD)) {
    record(
      isProd ? "fail" : "warn",
      "ADMIN_PASSWORD",
      "still the shipped demo password — change it before going live"
    );
  } else {
    record("ok", "ADMIN_PASSWORD");
  }
} else {
  record("warn", "ADMIN_PASSWORD", "not set — run `npm run seed:admin` after filling this in");
}

if (process.env.ADMIN_EMAIL) record("ok", `ADMIN_EMAIL (${process.env.ADMIN_EMAIL})`);
else record("warn", "ADMIN_EMAIL", "not set — the admin account cannot be seeded");

/**
 * CLIENT_URL drives the CORS allowlist. Getting this wrong produces
 * "Not allowed by CORS" on every request from the browser, which reads like a
 * broken app rather than a config typo — so it is called out on its own.
 */
const clientUrl = process.env.CLIENT_URL;
if (!clientUrl) {
  // config falls back to http://localhost:3000, which is correct for local work
  // but silently breaks CORS the moment the storefront is on a real domain.
  record(
    isProd ? "fail" : "warn",
    "CLIENT_URL",
    "not set — defaults to http://localhost:3000; set the storefront's real origin"
  );
} else if (clientUrl.startsWith("http://") && isProd) {
  record("fail", "CLIENT_URL", "uses http:// in production — browsers will not send cookies");
} else {
  record("ok", `CLIENT_URL (${clientUrl})`);
}

const backendUrl = process.env.BACKEND_URL;
if (backendUrl?.startsWith("http://") && isProd) {
  record("fail", "BACKEND_URL", "uses http:// in production — callbacks and links will be insecure");
} else {
  record("ok", `BACKEND_URL (${backendUrl ?? "http://localhost:5000 (default)"})`);
}

// ── Payments ─────────────────────────────────────────────────────────────────

const gateway = process.env.SSL_COMMERCE_URL ?? "https://sandbox.sslcommerz.com";
const live = gateway.includes("securepay.sslcommerz.com");

if (!process.env.Store_ID || !process.env.Store_Password) {
  record(
    "warn",
    "SSLCommerz Store_ID / Store_Password",
    "not set — checkout will fail at payment time"
  );
} else if (live && !isProd) {
  record("warn", "SSLComMERGE_URL", "live gateway selected while NODE_ENV is not production");
} else {
  record("ok", `SSLCommerz gateway (${live ? "LIVE" : "sandbox"})`);
}

// ── Images ──────────────────────────────────────────────────────────────────

const cloudinary = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
].filter((key) => !process.env[key]);

if (cloudinary.length) {
  record(
    isProd ? "fail" : "warn",
    "Cloudinary credentials",
    `${cloudinary.join(", ")} missing — image upload will fail`
  );
} else {
  record("ok", "Cloudinary credentials");
}

// ── Cron ────────────────────────────────────────────────────────────────────

if (!process.env.CRON_SECRET) {
  record(
    isProd ? "fail" : "warn",
    "CRON_SECRET",
    "missing — GET /api/v1/cron/* is unauthenticated without it"
  );
} else if (process.env.CRON_SECRET.length < 24) {
  record("warn", "CRON_SECRET", "too short — use at least 24 random characters");
} else {
  record("ok", "CRON_SECRET");
}

// ── Report ──────────────────────────────────────────────────────────────────

const ICON: Record<Level, string> = { ok: "  ok  ", warn: " warn ", fail: " FAIL " };
const GROUPS: Array<[string, (c: Check) => boolean]> = [
  ["Required", (c: Check) => /^(MONGO_URI|JWT|\.env)/.test(c.label)],
  [
    "Storefront & callbacks",
    (c: Check) => /^(CLIENT_URL|BACKEND_URL)/.test(c.label),
  ],
  ["Admin seed", (c: Check) => /^ADMIN_/.test(c.label)],
  ["Payments", (c: Check) => /SSL/i.test(c.label)],
  ["Images & jobs", (c: Check) => /^(Cloudinary|CRON_SECRET)/.test(c.label)],
];

console.log("\n  X-Mart API — configuration check\n");

for (const [title, belongs] of GROUPS) {
  const group = checks.filter(belongs);
  if (!group.length) continue;

  console.log(`  ${title}`);
  for (const check of group) {
    console.log(`  [${ICON[check.level]}] ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log("");
}

const failures = checks.filter((c) => c.level === "fail");
const warnings = checks.filter((c) => c.level === "warn");

if (failures.length) {
  console.log(
    `  ${failures.length} blocking problem(s). Fix the FAIL lines above, then run \`npm run doctor\` again.\n`
  );
  process.exit(1);
}

if (warnings.length) {
  console.log(`  ${warnings.length} warning(s) — fine for development, read before going live.\n`);
} else {
  console.log("  Configuration looks good.\n");
}

console.log(
  `  Next: npm run seed        (catalog + demo data)\n        npm run dev          (start the API)\n`
);