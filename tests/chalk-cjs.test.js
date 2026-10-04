const { test } = require("node:test");
const assert = require("node:assert");

test("CommonJS chalk import matches log() and ready-handler usage", () => {
  const chalk = require("chalk").default ?? require("chalk");
  assert.equal(typeof chalk.green, "function");
  assert.equal(typeof chalk.red, "function");
  assert.equal(typeof chalk.grey, "function");
  assert.doesNotThrow(() => {
    chalk.green("ok");
  });
});

test("log() styled paths do not throw with installed chalk", () => {
  const { log } = require("../src/functions");
  for (const style of ["info", "err", "warn", "done"]) {
    assert.doesNotThrow(() => log(`chalk-${style}`, style));
  }
});
