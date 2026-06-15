/**
 * Regression: moderation slash commands must guard null getMember() before
 * reading kickable/bannable (non-members in the user picker).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const moderationFiles = ["ban.js", "kick.js"];

for (const file of moderationFiles) {
  test(`${file} guards null member before kickable/bannable check`, () => {
    const src = fs.readFileSync(
      path.join(__dirname, "../src/commands/slash/moderation", file),
      "utf8"
    );

    const memberAssign = src.indexOf("getMember");
    const nullGuard = src.indexOf("if (!member)");
    const permissionCheck = src.indexOf(file === "ban.js" ? ".bannable" : ".kickable");

    assert.ok(memberAssign >= 0, "expected getMember usage");
    assert.ok(nullGuard > memberAssign, "expected null guard after getMember");
    assert.ok(
      permissionCheck > nullGuard,
      "expected permission check after null guard"
    );
  });
}
