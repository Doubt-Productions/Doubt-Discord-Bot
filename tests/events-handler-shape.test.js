/**
 * Regression: function-style event modules in one folder (e.g. ready/) must
 * share a single listener and run sequentially. Registering one listener per
 * file lets async handlers interleave after their first await, so slash and
 * context-menu registration can race the Discord REST API.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("events handler batches folder function modules into one sequential listener", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );

  assert.ok(
    src.includes("functionHandlers") &&
      src.includes("functionHandlers.push") &&
      src.includes("for (const handler of functionHandlers)"),
    "expected functionHandlers array and sequential await loop"
  );
  assert.ok(
    src.match(/client\.on\(folderName/g)?.length === 1,
    "expected exactly one client.on(folderName, ...) for batched function handlers"
  );
  assert.ok(
    src.includes("typeof eventModule.run === \"function\"") &&
      src.includes("eventModule.event"),
    "expected object-module branch with eventModule.run and eventModule.event"
  );
  assert.ok(
    src.includes('folderName === "validations"'),
    "expected validations folder special-case"
  );
});
