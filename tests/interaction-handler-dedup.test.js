/**
 * Regression: Guild interactionCreate/components must not execute commands or
 * components. The validator chain in src/events/validations/ is the sole
 * execution path; running both caused double replies and economy corruption.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("Guild interactionCreate does not execute slash commands", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/interactionCreate.js"),
    "utf8"
  );

  assert.ok(
    !src.includes("command.run("),
    "Guild interactionCreate must not call command.run"
  );
  assert.ok(
    !src.includes("collection.interactioncommands"),
    "Guild interactionCreate must not load commands from collection"
  );
});

test("Guild components handler does not execute button/select/modal runs", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/components.js"),
    "utf8"
  );

  assert.ok(!src.includes("component.run("), "Guild components must not call component.run");
  assert.ok(
    !src.includes("collection.components"),
    "Guild components must not load from collection"
  );
});

test("validators guard against already-acknowledged interactions", () => {
  for (const file of [
    "chatInputCommandValidator.js",
    "devCommandValidator.js",
    "contextMenuCommandValidator.js",
    "buttonValidator.js",
    "selectMenuValidator.js",
    "ModalCommandValidator.js",
  ]) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/events/validations", file),
      "utf8"
    );
    assert.ok(
      src.includes("interaction.replied || interaction.deferred"),
      `${file} should skip already-acknowledged interactions`
    );
  }
});
