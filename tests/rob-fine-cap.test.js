/**
 * Failed robbery fines must not exceed the robber's wallet; the roll is based on
 * the victim's balance, so uncapped subtraction produced negative wallets.
 */
const { test } = require("node:test");
const assert = require("node:assert");

function caughtRobberyFine(rolledFine, robberWallet) {
  return Math.min(rolledFine, robberWallet);
}

test("fine is capped when roll exceeds robber wallet", () => {
  assert.strictEqual(caughtRobberyFine(5000, 100), 100);
});

test("fine is unchanged when roll is affordable", () => {
  assert.strictEqual(caughtRobberyFine(50, 100), 50);
});

test("zero wallet pays nothing", () => {
  assert.strictEqual(caughtRobberyFine(100, 0), 0);
});
