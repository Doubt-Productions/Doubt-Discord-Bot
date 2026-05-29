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
    /(?:folderName|name) === "validations"/.test(src),
    "expected validations folder special-case"
  );
  assert.ok(
    src.includes("continue") && src.includes("interactionCreate (validators)"),
    "expected validations block to register validator chain separately"
  );
  assert.ok(
    src.includes('aName === "validations"') && src.includes("eventFolders.sort"),
    "expected validations folder to register before Guild handlers"
  );
  assert.ok(
    src.includes("interactionCreateHandlers") &&
      src.includes("interactionCreate (Guild)"),
    "expected Guild interactionCreate modules to share one sequential listener"
  );
});
