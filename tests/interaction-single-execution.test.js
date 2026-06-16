/**
 * Regression: slash commands and components must execute exactly once per
 * interaction. Legacy Guild/interactionCreate.js and Guild/components.js
 * duplicated the validations/ chain, causing double DB writes (e.g. /beg)
 * and double side effects (e.g. ticket-close scheduling two channel deletes).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const guildEventsDir = path.join(__dirname, "../src/events/Guild");

test("Guild events must not register duplicate interactionCreate command handlers", () => {
  const files = fs.readdirSync(guildEventsDir).filter((f) => f.endsWith(".js"));

  assert.ok(
    !files.includes("interactionCreate.js"),
    "Guild/interactionCreate.js duplicates validations/chatInputCommandValidator.js and devCommandValidator.js"
  );
  assert.ok(
    !files.includes("components.js"),
    "Guild/components.js duplicates validations button/select/modal validators"
  );
});

test("interaction validators skip already-handled interactions", () => {
  const validatorFiles = [
    "chatInputCommandValidator.js",
    "devCommandValidator.js",
    "buttonValidator.js",
    "contextMenuCommandValidator.js",
    "ModalCommandValidator.js",
    "selectMenuValidator.js",
  ];

  for (const file of validatorFiles) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/events/validations", file),
      "utf8"
    );
    assert.ok(
      src.includes("interaction.replied") && src.includes("interaction.deferred"),
      `expected ${file} to guard against already-handled interactions`
    );
  }
});
