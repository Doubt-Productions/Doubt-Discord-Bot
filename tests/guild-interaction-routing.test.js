/**
 * Regression: Guild/interactionCreate must not call command.run for slash or context
 * menu commands — that path duplicated execution with events/validations/* (e.g. /eval twice).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("Guild interactionCreate does not execute command.run (validators own execution)", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/interactionCreate.js"),
    "utf8"
  );

  assert.ok(
    src.includes("isChatInputCommand()") &&
      src.includes("isContextMenuCommand()"),
    "expected chat and context menu types to be routed away from this handler"
  );
  assert.ok(
    !src.includes("command.run"),
    "Guild handler must not call command.run (duplicate with validations)"
  );
  assert.ok(
    !src.includes("client.collection.interactioncommands"),
    "Guild handler must not resolve commands from collection for execution"
  );
});
