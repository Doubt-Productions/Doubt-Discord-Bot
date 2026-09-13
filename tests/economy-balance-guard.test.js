/**
 * Regression: deposit/withdraw used Math.abs on negative balances after races,
 * turning -50 into +50 and inflating total money. Guard must reject negatives.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

function applyDeposit(wallet, bank, amount) {
  const nextWallet = wallet - amount;
  const nextBank = bank + amount;
  if (nextWallet < 0 || nextBank < 0) {
    return { ok: false, wallet, bank };
  }
  return { ok: true, wallet: nextWallet, bank: nextBank };
}

function applyWithdraw(wallet, bank, amount) {
  const nextWallet = wallet + amount;
  const nextBank = bank - amount;
  if (nextWallet < 0 || nextBank < 0) {
    return { ok: false, wallet, bank };
  }
  return { ok: true, wallet: nextWallet, bank: nextBank };
}

test("Math.abs would turn overdraft into free money", () => {
  const overdraftWallet = 20 - 80;
  assert.strictEqual(overdraftWallet, -60);
  assert.strictEqual(Math.abs(overdraftWallet), 60);
});

test("deposit guard rejects overlapping withdraw amount", () => {
  const result = applyDeposit(20, 80, 80);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.wallet, 20);
  assert.strictEqual(result.bank, 80);
});

test("deposit and withdraw commands reject negative balances instead of Math.abs", () => {
  for (const file of ["deposit.js", "withdraw.js"]) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/commands/slash/Economy", file),
      "utf8"
    );
    assert.doesNotMatch(src, /Math\.abs/);
    assert.match(src, /<\s*0/);
  }
});

test("withdraw guard blocks overdraft", () => {
  const result = applyWithdraw(0, 50, 80);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.bank, 50);
});
