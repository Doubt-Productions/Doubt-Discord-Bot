/**
 * When a robbery fails, the old code subtracted the same random "stolen" amount
 * from the robber even when it exceeded their wallet, producing negative balances.
 */
const { test } = require("node:test");
const assert = require("node:assert");

function robFailurePenalty(stolenAmount, robberWallet) {
  return Math.min(stolenAmount, robberWallet);
}

test("caught penalty never exceeds robber wallet", () => {
  assert.strictEqual(robFailurePenalty(5000, 100), 100);
  assert.strictEqual(robFailurePenalty(50, 100), 50);
});

test("robber balance stays non-negative after penalty", () => {
  const wallet = 100;
  const penalty = robFailurePenalty(9999, wallet);
  assert.ok(wallet - penalty >= 0);
});
