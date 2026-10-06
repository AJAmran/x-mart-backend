#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# First-boot setup for the API container.
#
# A store owner should be able to run `docker compose up -d` and get a working,
# browsable shop — not an empty database they have to populate by hand. This
# script does the parts that must happen exactly once, in the right order, and
# is safe to run on every boot because each step is idempotent:
#
#   1. wait for MongoDB to accept connections
#   2. report configuration problems (advisory — the real boot check is the API)
#   3. ensure indexes exist (needed in production, where autoIndex is off)
#   4. create the admin account if it does not exist
#   5. import the demo catalog if the store has no products
#
# Set SEED_DEMO_CATALOG=false to start with a genuinely empty catalogue.
# ─────────────────────────────────────────────────────────────────────────────
set -e

log() { echo "[entrypoint] $*"; }

log "waiting for MongoDB..."
ATTEMPTS=0
until node -e "
  const mongoose = require('mongoose');
  const uri = process.env.MONGO_URI;
  mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
" 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    log "ERROR: could not reach MongoDB after 30 attempts."
    log "       Check MONGO_URI in your .env file."
    exit 1
  fi
  sleep 2
done
log "MongoDB is reachable."

# Configuration check. Non-fatal: the API performs its own hard checks on boot,
# and we do not want a warning to stop a container that is otherwise fine.
if node dist/scripts/doctor.js; then
  log "configuration check passed."
else
  log "configuration check reported problems — see above (continuing)."
fi

# Indexes. autoIndex is disabled when NODE_ENV=production, so a fresh database
# would otherwise be missing the unique constraints on sku/email/branch code.
log "ensuring database indexes..."
node dist/scripts/syncIndexes.js

# The admin account.
if [ -n "$ADMIN_EMAIL" ]; then
  log "ensuring admin account ($ADMIN_EMAIL)..."
  node dist/seed/seed.js --admin
else
  log "ADMIN_EMAIL not set — skipping admin seed."
fi

# Demo catalogue.
if [ "${SEED_DEMO_CATALOG:-true}" = "true" ]; then
  COUNT=$(node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .then(async (m) => {
        const n = await m.connection.collection('products').countDocuments();
        console.log(n);
        await m.disconnect();
      })
      .catch(() => { console.log(0); process.exit(0); });
  " 2>/dev/null || echo 0)

  if [ "$COUNT" = "0" ]; then
    log "empty catalogue detected — importing the demo store..."
    node dist/seed/seedCatalog.js
  else
    log "catalogue already has $COUNT products — skipping import."
  fi
else
  log "SEED_DEMO_CATALOG=false — starting with an empty catalogue."
fi

log "starting API on port ${PORT:-5000}"
exec node dist/server.js