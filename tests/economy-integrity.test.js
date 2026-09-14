const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const depositSource = fs.readFileSync(
  path.join(__dirname, "../src/commands/slash/Economy/deposit.js"),
  "utf8"
);
const withdrawSource = fs.readFileSync(
  path.join(__dirname, "../src/commands/slash/Economy/withdraw.js"),
  "utf8"
);
const begSource = fs.readFileSync(
  path.join(__dirname, "../src/commands/slash/Economy/beg.js"),
  "utf8"
);

test("deposit acquires per-user lock before database reads", () => {
  assert.match(depositSource, /acquireEconomyLock/);
  assert.ok(
    depositSource.indexOf("acquireEconomyLock") <
      depositSource.indexOf("ecoSchema.findFirst")
  );
  assert.doesNotMatch(depositSource, /Math\.abs/);
});

test("withdraw acquires per-user lock before database reads", () => {
  assert.match(withdrawSource, /acquireEconomyLock/);
  assert.ok(
    withdrawSource.indexOf("acquireEconomyLock") <
      withdrawSource.indexOf("ecoSchema.findFirst")
  );
  assert.doesNotMatch(withdrawSource, /Math\.abs/);
});

test("beg requires an economy account before applying wallet changes", () => {
  assert.match(begSource, /if \(!Data\)/);
  assert.ok(
    begSource.indexOf("if (!Data)") < begSource.indexOf("Data.Wallet +=")
  );
});
