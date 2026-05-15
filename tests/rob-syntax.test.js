/**
 * Ensures /rob command source parses. A bad merge previously left rob.js with a
 * SyntaxError, which breaks process startup when command files are loaded.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("rob command source is valid JavaScript", () => {
  const robPath = path.join(
    __dirname,
    "..",
    "src",
    "commands",
    "slash",
    "Economy",
    "rob.js"
  );
  const code = fs.readFileSync(robPath, "utf8");
  assert.doesNotThrow(() => {
    new vm.Script(code, { filename: robPath });
  });
});
