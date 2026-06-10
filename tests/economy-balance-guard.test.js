/**
 * Regression: deposit/withdraw must not use Math.abs on balances, which turns
 * negative wallet/bank values into minted money after concurrent updates.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("deposit and withdraw do not clamp balances with Math.abs", () => {
  for (const file of ["deposit.js", "withdraw.js"]) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/commands/slash/Economy", file),
      "utf8"
    );
    assert.ok(
      !src.includes("Math.abs"),
      `${file} must not use Math.abs on balances`
    );
  }
});
