/**
 * Regression: /rank reset and /rank set must require ManageGuild.
 * Without this gate any member can wipe or inflate another user's XP.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("rank reset and set subcommands gate on ManageGuild", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );

  assert.match(src, /PermissionFlagsBits\.ManageGuild/);
  assert.match(
    src,
    /case\s+"reset":[\s\S]*PermissionFlagsBits\.ManageGuild/
  );
  assert.match(
    src,
    /case\s+"set":[\s\S]*PermissionFlagsBits\.ManageGuild/
  );
});
