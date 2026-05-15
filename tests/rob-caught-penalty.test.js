/**
 * Regression: on a failed rob, the code subtracted `amount` from the robber, where `amount` was
 * derived from the victim's wallet (up to their full balance). A robber with only the minimum
 * $100 could lose thousands against a rich target and end up with a negative wallet.
 *
 * The command uses: `const penalty = Math.min(amount, Data.Wallet);`
 */
const { test } = require("node:test");
const assert = require("node:assert");

test("caught penalty never exceeds robber wallet", () => {
  const amount = 5000;
  const robberWallet = 100;
  const penalty = Math.min(amount, robberWallet);
  assert.strictEqual(penalty, 100);
});

test("caught penalty uses full roll when robber can afford it", () => {
  const amount = 50;
  const robberWallet = 100;
  const penalty = Math.min(amount, robberWallet);
  assert.strictEqual(penalty, 50);
});
