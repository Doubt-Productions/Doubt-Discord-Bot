/**
 * Regression: /ban and /kick called getMember() then accessed .bannable/.kickable
 * without a null check. Users not in the guild (left or never joined) return null
 * from getMember(), crashing the handler with TypeError.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("ban handles users who are not guild members", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/moderation/ban.js"),
    "utf8"
  );

  assert.match(src, /getUser\(["']user["'],\s*true\)/);
  assert.match(src, /getMember\(["']user["']\)/);
  assert.match(src, /if \(member && !member\.bannable\)/);
  assert.match(src, /guild\.members\.ban\(user\.id/);
  assert.doesNotMatch(src, /if \(!member\.bannable\)/);
});

test("kick rejects users who are not guild members", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/moderation/kick.js"),
    "utf8"
  );

  assert.match(src, /if \(!member\)/);
  assert.match(src, /not in this server/i);
  assert.match(src, /if \(!member\.kickable\)/);
  const memberNullIndex = src.indexOf("if (!member)");
  const kickableIndex = src.indexOf("if (!member.kickable)");
  assert.ok(
    memberNullIndex !== -1 && kickableIndex !== -1 && memberNullIndex < kickableIndex,
    "null member check must precede kickable check"
  );
});
