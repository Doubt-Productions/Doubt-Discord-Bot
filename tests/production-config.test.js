const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("example config uses strict PRODUCTION === true checks", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/example.config.js"),
    "utf8"
  );

  assert.match(src, /process\.env\.PRODUCTION === "true"/);
  assert.doesNotMatch(src, /process\.env\.PRODUCTION\s*\?\s*process\.env\.MONGODB_URI/);
  assert.doesNotMatch(src, /dbName:\s*process\.env\.PRODUCTION\s*\?/);
});
