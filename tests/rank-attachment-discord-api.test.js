/**
 * Regression: /rank must pass an AttachmentBuilder (or buffer payload) to
 * interaction.reply. discord.js AttachmentBuilder has no .build(); chaining
 * it throws and breaks the slash command on every invocation.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("rank command attaches image via AttachmentBuilder without .build()", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );

  assert.ok(
    src.includes("new AttachmentBuilder(imageBuffer, { name: \"rank.png\" })"),
    "expected AttachmentBuilder(buffer, { name }) without erroneous .build()"
  );
  assert.ok(
    !/AttachmentBuilder\([^)]*\)\.build\(\)/.test(src),
    "must not call .build() on AttachmentBuilder"
  );
});
