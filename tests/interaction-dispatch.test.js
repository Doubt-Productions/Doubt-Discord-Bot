/**
 * Regression: restoring Guild interactionCreate/components registration (c430893)
 * must not re-introduce a second command/component dispatch path alongside
 * src/events/validations/* — that double-ran handlers and corrupted economy writes.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const guildEventsDir = path.join(__dirname, "../src/events/Guild");
const validationsDir = path.join(__dirname, "../src/events/validations");

const removedDuplicateHandlers = ["interactionCreate.js", "components.js"];

const forbiddenInteractionDispatchPatterns = [
  /client\.collection\.interactioncommands/,
  /client\.collection\.developercommands/,
  /client\.collection\.components/,
];

test("duplicate Guild interaction dispatch modules stay removed", () => {
  for (const file of removedDuplicateHandlers) {
    assert.ok(
      !fs.existsSync(path.join(guildEventsDir, file)),
      `${file} must not register a second interaction dispatch path`
    );
  }
});

test("remaining Guild event modules do not dispatch interactions via collections", () => {
  for (const file of fs.readdirSync(guildEventsDir)) {
    if (!file.endsWith(".js")) continue;
    const src = fs.readFileSync(path.join(guildEventsDir, file), "utf8");
    for (const pattern of forbiddenInteractionDispatchPatterns) {
      assert.ok(
        !pattern.test(src),
        `${file} must not match ${pattern} (validations own interaction dispatch)`
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
