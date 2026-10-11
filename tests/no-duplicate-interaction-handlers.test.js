/**
 * Regression: duplicate Guild interactionCreate/components handlers caused
 * validators and backup routers to both invoke .run() on the same interaction.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("events handler batches validators and Guild interactionCreate into one listener", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );

  assert.match(src, /folderName === "validations"/);
  assert.match(
    src,
    /for \(const eventModule of interactionCreateHandlers\)/
  );
  assert.equal(
    (src.match(/client\.on\("interactionCreate"/g) || []).length,
    1,
    "expected exactly one interactionCreate registration"
  );
});

test("Guild execution modules are object exports with interactionCreate event", () => {
  for (const file of ["interactionCreate.js", "components.js"]) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/events/Guild", file),
      "utf8"
    );
    assert.match(src, /event:\s*["']interactionCreate["']/);
    assert.match(src, /run:\s*async/);
  }
});
