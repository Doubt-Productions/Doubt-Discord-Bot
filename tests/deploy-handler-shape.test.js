/**
 * Regression: developer command deploy must not use REST.put on
 * Routes.applicationGuildCommands, which replaces the full guild command list and
 * can wipe slash commands when it completes after registerCommands.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("deploy handler uses incremental guild command registration, not bulk PUT", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/deploy.js"),
    "utf8"
  );

  assert.ok(
    !src.includes("rest.put") && !src.includes("REST("),
    "deploy must not bulk PUT guild commands"
  );
  assert.ok(
    src.includes("getApplicationCommands") &&
      src.includes("applicationCommands.create") &&
      src.includes("applicationCommands.edit"),
    "expected incremental create/edit via ApplicationCommandManager"
  );
});
