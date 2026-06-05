/**
 * Regression: src/handlers/events.js must register Discord event names from
 * each module's `event` field and call `eventModule.run` for object exports.
 * interactionCreate handlers (validators + Guild) must share one listener so
 * validation runs before command execution and components are not double-run.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("events handler uses per-module registration and .run for object exports", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );

  assert.ok(
    src.includes("typeof eventModule.run === \"function\"") &&
      src.includes("eventModule.event"),
    "expected object-module branch with eventModule.run and eventModule.event"
  );
  assert.ok(
    src.includes("interactionCreateHandlers"),
    "expected deferred interactionCreate handler collection"
  );
  assert.ok(
    src.includes('eventModule.event === "interactionCreate"'),
    "expected interactionCreate modules to be batched into one listener"
  );
  assert.ok(
    src.includes("validationEventFiles") &&
      src.includes("for (const eventModule of interactionCreateHandlers)"),
    "expected validators to run before Guild interactionCreate handlers in one chain"
  );
});

test("Guild components duplicate handler removed", () => {
  const componentsPath = path.join(
    __dirname,
    "../src/events/Guild/components.js"
  );
  assert.ok(!fs.existsSync(componentsPath));
});

test("slash command validators validate only and do not execute", () => {
  for (const file of [
    "chatInputCommandValidator.js",
    "devCommandValidator.js",
    "contextMenuCommandValidator.js",
  ]) {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/events/validations", file),
      "utf8"
    );
    assert.ok(
      !src.includes(".run(client, interaction)"),
      `${file} must not execute commands; Guild/interactionCreate.js does`
    );
  }
});
