/**
 * Regression: Guild/interactionCreate.js must not invoke command.run().
 * The validations folder registers a shared interactionCreate listener that
 * runs chatInputCommandValidator / devCommandValidator / context menu handlers,
 * each of which ends with commandObject.run. Executing command.run in the Guild
 * handler as well causes double replies and double side effects (e.g. economy).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("Guild interactionCreate does not execute commands (validators own run)", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/interactionCreate.js"),
    "utf8"
  );

  assert.ok(
    !src.includes("await command.run(client, interaction)"),
    "Guild handler must not call command.run; validators execute application commands"
  );
});
