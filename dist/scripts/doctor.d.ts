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
import "dotenv/config";
