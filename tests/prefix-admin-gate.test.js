/**
 * Regression: ?prefix set/reset had no permission gate; any member could change
 * the guild prefix when prefix commands are enabled.
 */
const { test } = require("node:test");
const assert = require("node:assert");

/** Mirrors messageCreate prefix permission check */
function prefixPermissionGate(commandPermissions, memberPermissions) {
  if (
    commandPermissions &&
    !memberPermissions.has(commandPermissions)
  ) {
    return { action: "deny" };
  }

  return { action: "allow" };
}

test("prefix set requires configured permission", () => {
  const result = prefixPermissionGate("Administrator", new Set());
  assert.deepStrictEqual(result, { action: "deny" });
});

test("prefix set allows administrators", () => {
  const result = prefixPermissionGate("Administrator", new Set(["Administrator"]));
  assert.deepStrictEqual(result, { action: "allow" });
});
