/**
 * Regression: interaction dispatch must use one interactionCreate listener where
 * validators run first, then Guild execution handlers — not parallel listeners
 * that both call .run() (economy double-writes, InteractionAlreadyReplied).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const guildEventsDir = path.join(__dirname, "../src/events/Guild");
const validationsDir = path.join(__dirname, "../src/events/validations");

const executionHandlers = ["interactionCreate.js", "components.js"];

const forbiddenInteractionDispatchPatterns = [
  /client\.collection\.interactioncommands/,
  /client\.collection\.developercommands/,
  /client\.collection\.components/,
];

test("Guild execution handlers exist for the unified interactionCreate chain", () => {
  for (const file of executionHandlers) {
    assert.ok(
      fs.existsSync(path.join(guildEventsDir, file)),
      `${file} must execute commands/components after validators in events.js`
    );
  }
});

test("remaining Guild event modules do not dispatch interactions via collections", () => {
  for (const file of fs.readdirSync(guildEventsDir)) {
    if (!file.endsWith(".js")) continue;
    if (executionHandlers.includes(file)) continue;
    const src = fs.readFileSync(path.join(guildEventsDir, file), "utf8");
    for (const pattern of forbiddenInteractionDispatchPatterns) {
      assert.ok(
        !pattern.test(src),
        `${file} must not match ${pattern} (execution belongs in interactionCreate.js / components.js)`
      );
    }
  }
});

test("validation handlers guard against duplicate execution", () => {
  for (const file of fs.readdirSync(validationsDir)) {
    if (!file.endsWith(".js")) continue;
    const src = fs.readFileSync(path.join(validationsDir, file), "utf8");
    if (!src.includes(".run(client, interaction)")) continue;
    assert.ok(
      src.includes("interaction.replied") && src.includes("interaction.deferred"),
      `${file} must skip when the interaction was already handled`
    );
  }
});

test("slash and component validators validate only", () => {
  for (const file of [
    "chatInputCommandValidator.js",
    "devCommandValidator.js",
    "buttonValidator.js",
    "selectMenuValidator.js",
    "ModalCommandValidator.js",
  ]) {
    const src = fs.readFileSync(path.join(validationsDir, file), "utf8");
    assert.ok(
      !/\bawait\s+\w+\.run\s*\(/.test(src),
      `${file} must not execute handlers; Guild modules run after validation`
    );
  }
});
