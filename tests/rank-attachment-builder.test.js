/**
 * Regression: discord.js AttachmentBuilder has no .build() method.
 * Calling it throws after canvacord Rank#build succeeds, breaking /rank info.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");

test("AttachmentBuilder API has no build() (discord.js v14)", () => {
  const a = new AttachmentBuilder(Buffer.alloc(0), { name: "rank.png" });
  assert.strictEqual(typeof a.build, "undefined");
});

test("rank slash command attaches buffer without calling .build()", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );
  assert.ok(
    src.includes("new AttachmentBuilder(data, { name: \"rank.png\" })"),
    "expected AttachmentBuilder with buffer and name option"
  );
  assert.ok(
    !src.includes("AttachmentBuilder(data, { name: \"rank.png\" }).build()"),
    "must not call non-existent AttachmentBuilder.build()"
  );
});
