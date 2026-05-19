/**
 * Regression: discord.js v14 AttachmentBuilder is passed directly in the
 * `files` array. Calling .build() throws (no such method) and breaks /rank info.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("node:path");
const { AttachmentBuilder } = require("discord.js");

test("AttachmentBuilder has no build(); rank command must not call it", () => {
  assert.strictEqual(
    AttachmentBuilder.prototype.build,
    undefined,
    "discord.js AttachmentBuilder should not define build()"
  );

  const rankSrc = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );
  assert.ok(
    !/AttachmentBuilder\([^)]*\)\s*\.\s*build\s*\(/.test(rankSrc),
    "rank command must not chain .build() on AttachmentBuilder"
  );
});
