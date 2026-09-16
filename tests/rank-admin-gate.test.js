/**
 * Regression: /rank reset and /rank set had no permission gate — any member could
 * wipe or inflate XP for anyone in the guild.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("rank reset and set require ManageGuild at registration and runtime", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );

  const resetBlock = src.slice(
    src.indexOf('.setName("reset")'),
    src.indexOf('.setName("set")')
  );
  const setBlock = src.slice(
    src.indexOf('.setName("set")'),
    src.indexOf(".toJSON()")
  );

  assert.match(resetBlock, /setDefaultMemberPermissions\(PermissionFlagsBits\.ManageGuild\)/);
  assert.match(setBlock, /setDefaultMemberPermissions\(PermissionFlagsBits\.ManageGuild\)/);
  assert.match(src, /case "reset":[\s\S]*ManageGuild/);
  assert.match(src, /case "set":[\s\S]*ManageGuild/);
});
