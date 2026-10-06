// ─────────────────────────────────────────────────────────────────────────────
// Creates the application database user on first boot.
//
// The mongo image only creates MONGO_INITDB_ROOT_USERNAME/PASSWORD, so a
// connect string built for a separate app user would fail authentication. This
// runs once, when the data volume is empty, and gives the API the least
// privilege it actually needs.
//
// The API deliberately does NOT get dropDatabase or any cluster-admin rights:
// if the API is compromised, the blast radius is its own database.
// ─────────────────────────────────────────────────────────────────────────────

const appUser = process.env.MONGO_APP_USER || "appuser";
const appPassword = process.env.MONGO_APP_PASSWORD;
const dbName = process.env.MONGO_DB_NAME || "xmart";

if (!appPassword) {
  throw new Error("MONGO_APP_PASSWORD must be set to create the application user");
}

const appDb = db.getSiblingDB(dbName);

appDb.createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: "readWrite", db: dbName }],
});

print(`created application user "${appUser}" with readWrite on "${dbName}"`);