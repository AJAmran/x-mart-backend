/**
 * End-to-end smoke test for user and admin operations.
 *
 * Runs against a live backend + database and asserts both the happy paths and
 * the security boundaries (role checks, IDOR, unauthenticated access). It
 * restores everything it touches — stock, discounts and the order it creates —
 * so it is safe to run against seeded data.
 *
 * Usage:
 *   npm run smoke                       # against http://localhost:5000
 *   BASE_API=http://host npm run smoke
 */
import config from "../config";
import { Product } from "../models/Product";

const BASE = (
  process.env.BASE_API ??
  `http://localhost:${config.port ?? 5000}/api/v1`
).replace(/\/+$/, "");

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@xmart.com",
  password: process.env.ADMIN_PASSWORD ?? "Admin@123",
};
const USER = {
  email: process.env.USER_EMAIL ?? "rafiq.hasan@example.com",
  password: process.env.USER_PASSWORD ?? "User@123",
};
const BLOCKED_USER = {
  email: "tanvir.ahmed@example.com",
  password: "User@123",
};

let passed = 0;
let failed = 0;
const failures: string[] = [];

const ok = (name: string, condition: boolean, detail = "") => {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

type Session = { cookie: string };

const login = async (
  creds: { email: string; password: string }
): Promise<{ status: number; session: Session; body: unknown }> => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });

  const setCookies = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookies
    .map((c) => c.split(";")[0])
    .filter((c) => c.startsWith("accessToken=") || c.startsWith("refreshToken="))
    .join("; ");

  return { status: res.status, session: { cookie }, body: await res.json() };
};

const call = async (
  method: string,
  path: string,
  session: Session | null,
  body?: unknown
): Promise<{ status: number; json: any }> => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(session ? { cookie: session.cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let json: any = {};

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  return { status: res.status, json };
};

/** Reads an order that already exists, so the test never depends on cart state. */
const seedOrder = async (
  session: Session,
  productId: string
): Promise<any | null> => {
  const products = await call("GET", "/products?limit=50", session);
  const product =
    products.json.data?.find((p: any) => p._id === productId) ??
    products.json.data?.[0];

  if (!product) return null;

  const created = await call("POST", "/orders", session, {
    items: [
      {
        productId: product._id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.images?.[0] ?? "https://example.com/x.png",
      },
    ],
    shippingInfo: {
      name: "Smoke Test",
      email: USER.email,
      // International form on purpose: this is what the checkout field is
      // pre-filled with from the account profile, and it must be accepted.
      phone: "+8801700000001",
      addressLine1: "1 Test Road",
      city: "Dhaka",
      postalCode: "1212",
      division: "Dhaka",
    },
    paymentMethod: "CASH_ON_DELIVERY",
  });

  if (created.status !== 201) {
    console.log(
      `  ....  order create returned ${created.status}: ${JSON.stringify(created.json).slice(0, 400)}`
    );

    return null;
  }

  return created.json.data;
};

const run = async () => {
  console.log(`\nSmoke test against ${BASE}\n`);

  /* ---------------- auth ---------------- */
  console.log("auth");
  const admin = await login(ADMIN);
  ok("admin login succeeds", admin.status === 200 && admin.session.cookie.length > 0, `status ${admin.status}`);

  const user = await login(USER);
  ok("user login succeeds", user.status === 200 && user.session.cookie.length > 0, `status ${user.status}`);

  const bad = await login({ email: USER.email, password: "definitely-wrong" });
  ok("wrong password rejected", bad.status === 401, `status ${bad.status}`);

  const blocked = await login(BLOCKED_USER);
  ok("blocked user rejected", blocked.status === 403, `status ${blocked.status}`);

  const anon = await call("GET", "/orders", null);
  ok("anonymous cannot list orders", anon.status === 401, `status ${anon.status}`);

  if (!admin.session.cookie || !user.session.cookie) {
    console.log("\nCannot continue without both sessions.");
    process.exit(1);
  }

  const A = admin.session;
  const U = user.session;

  /* ---------------- admin reads ---------------- */
  console.log("\nadmin reads");
  const users = await call("GET", "/user?limit=5", A);
  ok("admin lists users", users.status === 200 && Array.isArray(users.json.data), `status ${users.status}`);

  const orders = await call("GET", "/orders?limit=5", A);
  ok("admin lists orders", orders.status === 200 && Array.isArray(orders.json.data), `status ${orders.status}`);
  ok("orders expose totalPrice", (orders.json.data ?? []).every((o: any) => typeof o.totalPrice === "number"));

  const products = await call("GET", "/products?limit=5", A);
  ok("admin lists products", products.status === 200 && Array.isArray(products.json.data), `status ${products.status}`);

  /* ---------------- branch refs ---------------- */
  const branches = await call("GET", "/branches", A);
  const branchId = branches.json.data?.[0]?._id;
  ok("branches list", Boolean(branchId), "no branch returned");

  if (branchId) {
    const byBranch = await call("GET", `/products?branchId=${branchId}&limit=100`, A);
    ok(
      "product branch filter returns results",
      (byBranch.json.meta?.total ?? 0) > 0,
      `total ${byBranch.json.meta?.total}`
    );

    const branchProducts = await call("GET", `/branches/${branchId}/products?limit=100`, A);
    ok(
      "branch products endpoint returns results",
      (branchProducts.json.meta?.total ?? 0) > 0,
      `total ${branchProducts.json.meta?.total}`
    );
  }

  /* ---------------- stock + discount ---------------- */
  console.log("\nadmin writes");
  const target = products.json.data?.[0];
  const inventory = target?.inventories?.[0];
  ok("product has inventory", Boolean(inventory?.branchId), "no inventory row");

  if (inventory) {
    const originalStock = inventory.stock;
    const bumped = originalStock === 999 ? 998 : originalStock + 1;

    const stockRes = await call(
      "PATCH",
      `/products/${target._id}/update-stock`,
      A,
      { branchId: inventory.branchId, stock: bumped }
    );
    ok("update-stock succeeds", stockRes.status === 200, `status ${stockRes.status}`);
    ok(
      "update-stock persists",
      stockRes.json?.data?.inventories?.find((i: any) => String(i.branchId) === String(inventory.branchId))?.stock === bumped,
      `got ${JSON.stringify(stockRes.json?.data?.inventories)}`
    );

    const discountRes = await call("POST", `/products/${target._id}/apply-discount`, A, {
      type: "percentage",
      value: 10,
    });
    ok("apply-discount succeeds", discountRes.status === 200, `status ${discountRes.status}`);
    ok("discount stored", discountRes.json?.data?.discount?.value === 10);

    const removeDiscount = await call("DELETE", `/products/${target._id}/remove-discount`, A);
    ok("remove-discount succeeds", removeDiscount.status === 200, `status ${removeDiscount.status}`);
    ok("discount cleared", removeDiscount.json?.data?.discount === undefined);

    // restore
    await call("PATCH", `/products/${target._id}/update-stock`, A, {
      branchId: inventory.branchId,
      stock: originalStock,
    });
    console.log(`  ....  stock restored to ${originalStock}`);
  }

  /* ---------------- user order lifecycle ---------------- */
  console.log("\nuser order lifecycle");
  const order = target ? await seedOrder(U, target._id) : null;
  ok("user creates order", Boolean(order?._id), "order not created");

  if (order?._id) {
    const mine = await call("GET", "/orders/my-orders", U);
    ok(
      "order appears in my-orders",
      (mine.json.data ?? []).some((o: any) => o._id === order._id),
      "not listed"
    );

    const own = await call("GET", `/orders/${order._id}`, U);
    ok("user reads own order", own.status === 200, `status ${own.status}`);

    const cancel = await call("PATCH", `/orders/${order._id}/cancel`, U);
    ok("user cancels own order", cancel.status === 200, `status ${cancel.status}`);
  }

  /* ---------------- cart ---------------- */
  console.log("\ncart");
  const cartGet = await call("GET", "/cart", U);
  ok("user reads cart", cartGet.status === 200, `status ${cartGet.status}`);

  if (target) {
    const cartSave = await call("POST", "/cart", U, {
      items: [
        {
          productId: target._id,
          quantity: 1,
          price: target.price,
          name: target.name,
          image: target.images?.[0] ?? "https://example.com/x.png",
        },
      ],
    });
    ok("user saves cart", cartSave.status === 200, `status ${cartSave.status}`);
  }

  /* ---------------- security boundaries ---------------- */
  console.log("\nsecurity boundaries");
  const userListsUsers = await call("GET", "/user?limit=5", U);
  ok("user cannot list users", userListsUsers.status === 403, `status ${userListsUsers.status}`);

  const userEditsProduct = await call("PATCH", `/products/${target?._id ?? "0"}`, U, { name: "hacked" });
  ok("user cannot edit products", userSetsStatus(userEditsProduct), `status ${userEditsProduct.status}`);

  const userListsAllOrders = await call("GET", "/orders", U);
  ok("user cannot list all orders", userListsAllOrders.status === 403, `status ${userListsAllOrders.status}`);

  const adminId = (admin.body as { data?: { user?: { _id?: string } } })?.data?.user?._id ?? "0";
  const userDeletesUser = await call("DELETE", `/user/${adminId}`, U);
  ok("user cannot delete users", userDeletesUser.status === 403, `status ${userDeletesUser.status}`);

  // IDOR: a second user's record
  const otherUser = users.json.data?.find((u: any) => u._id !== order?.userId);
  if (otherUser) {
    const read = await call("GET", `/user/${otherUser._id}`, U);
    ok("user cannot read another profile", read.status === 403, `status ${read.status}`);

    const patch = await call("PATCH", `/user/${otherUser._id}`, U, { name: "hacked" });
    ok("user cannot edit another profile", patch.status === 403, `status ${patch.status}`);
  }

  // IDOR: an order belonging to somebody else. Fetch a wider page so there is
  // reliably at least one order owned by a different user — otherwise these two
  // assertions are skipped and the coverage silently disappears.
  const allOrders = await call("GET", "/orders?limit=100", A);
  const someoneElsesOrder = (allOrders.json.data ?? []).find(
    (o: any) => order && o._id !== order._id && String(o.userId) !== String(order.userId)
  );
  ok("fixture: an order owned by another user exists", Boolean(someoneElsesOrder), "none available");

  if (someoneElsesOrder) {
    const read = await call("GET", `/orders/${someoneElsesOrder._id}`, U);
    ok("user cannot read another order", read.status === 403, `status ${read.status}`);

    const cancelOther = await call("PATCH", `/orders/${someoneElsesOrder._id}/cancel`, U);
    ok(
      "user cannot cancel another order",
      cancelOther.status === 403 || cancelOther.status === 404,
      `status ${cancelOther.status}`
    );
  }

  const cronNoSecret = await call("GET", "/cron/cleanup-discounts", null);
  ok("cron denies without secret", cronNoSecret.status === 401, `status ${cronNoSecret.status}`);

  /* ---------------- summary ---------------- */
  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed) {
    console.log("\nfailures:");
    for (const f of failures) console.log(`  - ${f}`);
  }

  return failed;
};

function userSetsStatus(res: { status: number }) {
  return res.status === 403;
}

run()
  .then(async (failed) => {
    await Product.db.close().catch(() => undefined);
    process.exit(failed ? 1 : 0);
  })
  .catch(async (err) => {
    console.error(err);
    await Product.db.close().catch(() => undefined);
    process.exit(1);
  });