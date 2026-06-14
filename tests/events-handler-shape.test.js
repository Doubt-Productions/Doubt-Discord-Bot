/**
 * Regression: src/handlers/events.js must register Discord event names from
 * each module's `event` field and call `eventModule.run` for object exports.
 * A broken "one listener per folder" loop called `await eventFunction(client,
 * ...args)` on every file, which throws for `{ event, run }` modules and
 * registered the wrong event name (e.g. "Guild"), so messageCreate and Guild
 * interactionCreate never ran.
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
    src.includes('folderName === "validations"'),
    "expected validations folder special-case"
  );
  assert.ok(
    src.includes("guildComponents.run(client, ...args)") &&
      src.includes('fileName === "components.js"'),
    "expected Guild interaction handlers in validator chain without duplicate listeners"
  );
});
