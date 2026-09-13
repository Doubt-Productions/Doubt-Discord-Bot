/**
 * Regression: /ban and /kick called member.bannable/kickable without a null
 * guard when getMember returns null (user left or not cached).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("ban handles users not currently in the guild", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/moderation/ban.js"),
    "utf8"
  );

  assert.ok(
    src.includes("if (!member)") && src.includes("members.ban(user"),
    "expected ban to fall back to guild.members.ban when member is null"
  );
  assert.ok(
    src.indexOf("if (!member)") < src.indexOf("member.bannable"),
    "expected null-member branch before member.bannable access"
  );
});

test("kick rejects targets that are not guild members", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/moderation/kick.js"),
    "utf8"
  );

  assert.ok(
    src.includes("if (!member)") && src.includes("not in this server"),
    "expected kick to reply when member is null"
  );
  assert.ok(
    src.indexOf("if (!member)") < src.indexOf("member.kickable"),
    "expected null-member guard before member.kickable access"
  );
});
