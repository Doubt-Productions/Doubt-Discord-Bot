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

test("concurrent deposit and stale rob wallet update can duplicate balance", () => {
  let wallet = 100;
  let bank = 0;
  const stolen = 50;

  // Deposit moves wallet -> bank; rob only persists wallet from a stale read.
  const depositAll = () => {
    bank += wallet;
    wallet = 0;
  };
  const robSuccessStale = () => {
    wallet = 100 + stolen;
  };

  depositAll();
  robSuccessStale();
  assert.strictEqual(wallet + bank, 250, "expected exploit total 250 vs honest 150");
});

test("rob acquires eco user lock before balance reads", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/Economy/rob.js"),
    "utf8"
  );
  const lockIdx = src.indexOf("ecoUserLock.tryAcquireAll");
  const dataAwait = src.indexOf("await ecoSchema.findFirst");
  assert.ok(lockIdx !== -1, "expected ecoUserLock.tryAcquireAll");
  assert.ok(
    lockIdx < dataAwait,
    "lock must be taken before ecoSchema reads/writes"
  );
});
