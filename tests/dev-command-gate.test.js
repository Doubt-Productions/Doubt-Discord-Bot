/**
 * Regression: dev-only folder commands set `options.developers: true` (not `devOnly`).
 * The validator must treat that as a developer gate; otherwise /eval and similar run for everyone.
 */
const { test } = require("node:test");
const assert = require("node:assert");

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
