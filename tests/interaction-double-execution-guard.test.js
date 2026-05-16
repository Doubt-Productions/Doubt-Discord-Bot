/**
 * Regression: Guild/interactionCreate must not invoke command.run; slash and
 * dev commands are executed once from events/validations/*. A second run caused
 * double DB writes (e.g. economy). The validations listener must bail out when
 * a prior interactionCreate handler already replied (cooldown / deny paths).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("Guild slash handler does not run command.run (validators own execution)", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/interactionCreate.js"),
    "utf8"
  );
  assert.ok(
    !/\bcommand\.run\s*\(/.test(src),
    "Guild interactionCreate must not call command.run; validators execute commands"
  );
});

test("validations interactionCreate skips when interaction already handled", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );
  assert.ok(
    src.includes("folderName === \"validations\"") &&
      src.includes("interaction?.replied") &&
      src.includes("interaction?.deferred"),
    "expected validations listener to short-circuit on replied/deferred"
  );
});
