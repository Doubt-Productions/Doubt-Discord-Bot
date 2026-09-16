/**
 * Regression: duplicate Guild interactionCreate/components handlers caused
 * validators and backup routers to both invoke .run() on the same interaction.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("Guild folder does not register backup interactionCreate routers", () => {
  const guildDir = path.join(__dirname, "../src/events/Guild");
  const backupHandlers = ["interactionCreate.js", "components.js"];

  for (const file of backupHandlers) {
    assert.strictEqual(
      fs.existsSync(path.join(guildDir, file)),
      false,
      `expected backup handler removed: ${file}`
    );
  }
});

test("events handler registers validators only for interactionCreate chain", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );

  assert.match(src, /folderName === "validations"/);
  assert.match(src, /interactionCreate \(validators\)/);
});
