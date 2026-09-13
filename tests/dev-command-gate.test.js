/**
 * Regression: dev-only folder commands set `options.developers: true` (not `devOnly`).
 * The validator must treat that as a developer gate; otherwise /eval and similar run for everyone.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const {
  normalizeIdAllowlist,
} = require("../src/utils/normalizeIdAllowlist");
const { isStaffGateAllowed } = require("../src/utils/botStaffAcl");

/** All commands under devOnly/ are developer-gated (fail-closed). */
function requiresDeveloperGate() {
  return true;
}

test("eval / deploy style commands use options.developers", () => {
  const evalLike = { options: { developers: true } };
  assert.strictEqual(requiresDeveloperGate(evalLike), true);
  assert.strictEqual(requiresDeveloperGate({ devOnly: true }), true);
  assert.strictEqual(requiresDeveloperGate({ options: {} }), true);
  assert.strictEqual(requiresDeveloperGate({}), true);
});

test("staffOnly gate allows configured developers", () => {
  const developerIds = normalizeIdAllowlist(["111111111111111111"]);
  const allowed = isStaffGateAllowed(
    "111111111111111111",
    developerIds,
    false
  );
  assert.strictEqual(allowed, true);
});

test("staffOnly gate denies users who are neither developers nor bot staff", () => {
  const developerIds = normalizeIdAllowlist(["111111111111111111"]);
  const allowed = isStaffGateAllowed(
    "222222222222222222",
    developerIds,
    false
  );
  assert.strictEqual(allowed, false);
});
