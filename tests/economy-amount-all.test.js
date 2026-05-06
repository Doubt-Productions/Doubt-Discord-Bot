/**
 * Regression: deposit/withdraw used `amount.toLowerCase === "all"` (function vs string),
 * so the "all" branch never ran. Match the real predicate used in those commands.
 */
const { test } = require("node:test");
const assert = require("node:assert");

function isDepositOrWithdrawAll(amount) {
  return amount.toLowerCase() === "all";
}

test("all keyword matches case-insensitively", () => {
  assert.strictEqual(isDepositOrWithdrawAll("all"), true);
  assert.strictEqual(isDepositOrWithdrawAll("ALL"), true);
  assert.strictEqual(isDepositOrWithdrawAll("All"), true);
});

test("legacy bug: comparing method reference to string never matches", () => {
  const amount = "all";
  assert.strictEqual(amount.toLowerCase === "all", false);
});
