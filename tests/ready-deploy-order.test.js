/**
 * Developer deploy uses REST PUT with only dev commands, replacing the guild list.
 * It must run before registerCommands in the sequential ready chain.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("ready folder runs 0-deployDeveloperGuildCommands before registerCommands", () => {
  const dir = path.join(__dirname, "../src/events/ready");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .sort((a, b) => a.localeCompare(b));

  const iDeploy = files.indexOf("0-deployDeveloperGuildCommands.js");
  const iReg = files.indexOf("registerCommands.js");

  assert.ok(iDeploy >= 0, "expected 0-deployDeveloperGuildCommands.js in ready/");
  assert.ok(iReg >= 0, "expected registerCommands.js in ready/");
  assert.ok(
    iDeploy < iReg,
    "deploy must sort before registerCommands so slash commands are re-registered after the PUT"
  );
});

test("events handler sorts files per folder so ready order does not depend on FS readdir", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/handlers/events.js"),
    "utf8"
  );
  assert.ok(
    src.includes("getAllFiles(eventFolder).sort") &&
      src.includes("path.basename(a).localeCompare(path.basename(b))"),
    "expected sorted event file list for deterministic handler order"
  );
});
