/**
 * Regression: deposit/withdraw used Math.abs on Wallet/Bank after subtracting.
 * Two concurrent deposits can drive Wallet negative; Math.abs turns that into free money.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("Math.abs on wallet after concurrent overspend duplicates balance", () => {
  let wallet = 50;
  let bank = 0;
  const deposit = 50;

  // Both handlers read Wallet=50, pass the balance check, then apply updates.
  const applyStaleRead = () => {
    bank += deposit;
    wallet -= deposit;
    wallet = Math.abs(wallet);
  };

  applyStaleRead();
  applyStaleRead();
  assert.strictEqual(wallet, 50);
  assert.strictEqual(bank, 100);
});

test("deposit acquires eco user lock before first await", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/Economy/deposit.js"),
    "utf8"
  );
  const lockIdx = src.indexOf("ecoUserLock.tryAcquire");
  const firstAwait = src.indexOf("await ");
  assert.ok(lockIdx !== -1, "expected ecoUserLock.tryAcquire");
  assert.ok(lockIdx < firstAwait, "lock must be taken before any await");
  assert.ok(!src.includes("Math.abs(Data.Wallet)"));
});

test("withdraw acquires eco user lock before first await", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/Economy/withdraw.js"),
    "utf8"
  );
  const lockIdx = src.indexOf("ecoUserLock.tryAcquire");
  const firstAwait = src.indexOf("await ");
  assert.ok(lockIdx !== -1, "expected ecoUserLock.tryAcquire");
  assert.ok(lockIdx < firstAwait, "lock must be taken before any await");
  assert.ok(!src.includes("Math.abs(Data.Bank)"));
});
