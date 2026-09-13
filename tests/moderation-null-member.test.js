const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("ban command guards null member before bannable check", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/moderation/ban.js"),
    "utf8"
  );
  assert.match(source, /if \(!member\)/);
  assert.ok(source.indexOf("if (!member)") < source.indexOf("member.bannable"));
});

test("kick command guards null member before kickable check", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/moderation/kick.js"),
    "utf8"
  );
  assert.match(source, /if \(!member\)/);
  assert.ok(source.indexOf("if (!member)") < source.indexOf("member.kickable"));
});
