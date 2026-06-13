/**
 * Regression: Guild backup interactionCreate handlers must not call command.run
 * or component.run. Validators already execute after permission checks; parallel
 * backup routers duplicated /deposit, /withdraw, buttons, etc.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

function readEventSource(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

test("Guild slash backup handler does not execute commands", () => {
  const src = readEventSource("src/events/Guild/interactionCreate.js");

  assert.ok(
    !src.includes("command.run("),
    "Guild interactionCreate must not call command.run; validators own execution"
  );
  assert.ok(
    src.includes("validations"),
    "expected comment documenting validators as sole execution path"
  );
});

test("Guild component backup handler does not execute components", () => {
  const src = readEventSource("src/events/Guild/components.js");

  assert.ok(
    !src.includes("component.run("),
    "Guild components handler must not call component.run; validators own execution"
  );
});

test("validators still execute chat input commands", () => {
  const src = readEventSource(
    "src/events/validations/chatInputCommandValidator.js"
  );

  assert.ok(
    src.includes("await commandObject.run(client, interaction)"),
    "chat input validator must remain the execution path for slash commands"
  );
});
