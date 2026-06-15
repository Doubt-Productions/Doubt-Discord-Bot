/**
 * Regression: interactionCreate must use one sequential listener so validators
 * gate before Guild handlers run. Separate listeners caused every slash command
 * and button to execute twice in parallel (economy corruption, double eval).
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
    "expected consolidated interactionCreate handler list"
  );
  assert.ok(
    src.includes('eventModule.event === "interactionCreate"'),
    "expected Guild interactionCreate modules to join consolidated chain"
  );
  assert.ok(
    src.includes('folderName === "validations"'),
    "expected validations folder special-case"
  );
});

test("validators gate interactions without executing command run()", () => {
  const validatorDir = path.join(__dirname, "../src/events/validations");
  const files = fs.readdirSync(validatorDir).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const src = fs.readFileSync(path.join(validatorDir, file), "utf8");
    assert.ok(
      !src.includes(".run(client, interaction)"),
      `${file} must not execute handlers; Guild listeners own execution`
    );
  }
});
