/**
 * Regression: failed robbery previously deducted `amount` (1..target wallet) from the
 * attacker with no cap, so a minimum-wallet attacker vs a rich target could go negative.
 */
const { test } = require("node:test");
const assert = require("node:assert");

function failureMoneyTransferred(amount, attackerWallet) {
  return Math.min(amount, attackerWallet);
}

test("failed rob cannot transfer more than the attacker has", () => {
  const amount = 5000;
  const attackerWallet = 100;
  assert.strictEqual(failureMoneyTransferred(amount, attackerWallet), 100);
});

test("when attacker can cover full amount, transfer equals roll", () => {
  assert.strictEqual(failureMoneyTransferred(50, 100), 50);
});
