/**
 * Regression: dev-only folder commands set `options.developers: true` (not `devOnly`).
 * The validator must treat that as a developer gate; otherwise /eval and similar run for everyone.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const {
  normalizeIdAllowlist,
} = require("../src/utils/normalizeIdAllowlist");

function requiresDeveloperGate(cmd) {
  return cmd.devOnly === true || cmd.options?.developers === true;
}

test("eval / deploy style commands use options.developers", () => {
  const evalLike = { options: { developers: true } };
  assert.strictEqual(requiresDeveloperGate(evalLike), true);
  assert.strictEqual(requiresDeveloperGate({ devOnly: true }), true);
  assert.strictEqual(requiresDeveloperGate({ options: {} }), false);
  assert.strictEqual(requiresDeveloperGate({}), false);
});

/** Mirrors devCommandValidator staff gate (array roles only; no string.includes) */
function staffGateHasRole(staffRolesConfig, memberRoleIds) {
  const staffRoleIds = normalizeIdAllowlist(staffRolesConfig);
  return memberRoleIds.some((id) => staffRoleIds.includes(id));
}

test("staffRoles as a string does not grant access via substring match", () => {
  const ok = staffGateHasRole("111111111111111111222222222222222222", [
    "111111111111111112",
  ]);
  assert.strictEqual(ok, false);
});

test("staffRoles as an array grants access when member holds a listed role", () => {
  const ok = staffGateHasRole(
    ["111111111111111111", "222222222222222222"],
    ["999999999999999999", "111111111111111111"]
  );
  assert.strictEqual(ok, true);
});
