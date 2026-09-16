/**
 * Regression: discord.js v14 AttachmentBuilder has no .build(); calling it
 * throws and breaks /rank info when sending the canvacord image buffer.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");

test("AttachmentBuilder has no build() (API sanity)", () => {
  const a = new AttachmentBuilder(Buffer.from("x"), { name: "t.txt" });
  assert.strictEqual(typeof a.build, "undefined");
});

test("rank slash command sends AttachmentBuilder without .build()", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );
  assert.ok(
    !/AttachmentBuilder\s*\([^)]+\)\s*\.\s*build\s*\(/.test(src),
    "rank command must not chain .build() on AttachmentBuilder (not in discord.js v14)"
  );
});
