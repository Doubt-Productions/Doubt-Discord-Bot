/**
 * Regression: /beg subtracted from wallet with no floor, allowing unbounded
 * negative balances.
 */
const { test } = require("node:test");
const assert = require("node:assert");

function applyBegWallet(currentWallet, value) {
  return Math.max(0, currentWallet + value);
}

test("negative beg outcome cannot drive wallet below zero", () => {
  assert.strictEqual(applyBegWallet(50, -310), 0);
});

test("positive beg outcome still increases wallet", () => {
  assert.strictEqual(applyBegWallet(50, 120), 170);
});

test("large negative streak stays at zero", () => {
  let wallet = 50;
  for (let i = 0; i < 10; i++) {
    wallet = applyBegWallet(wallet, -200);
  }
  assert.strictEqual(wallet, 0);
});
