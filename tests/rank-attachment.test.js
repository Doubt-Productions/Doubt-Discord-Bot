/**
 * Regression: /rank info must pass AttachmentBuilder directly to reply files.
 * discord.js v14 AttachmentBuilder has no .build() method.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("rank info does not call invalid AttachmentBuilder.build()", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );
  assert.ok(
    !src.includes("AttachmentBuilder(data, { name: \"rank.png\" }).build()"),
    "AttachmentBuilder must be passed directly without .build()"
  );
  assert.ok(
    src.includes("new AttachmentBuilder(data, { name: \"rank.png\" })"),
    "expected AttachmentBuilder usage in rank info reply"
  );
});
