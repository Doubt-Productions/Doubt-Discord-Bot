/**
 * discord.js AttachmentBuilder has no .build() — chaining it throws at runtime
 * when /rank info sends the generated image.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("rank slash command does not chain AttachmentBuilder to .build()", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );
  assert.ok(
    !/AttachmentBuilder\([^)]*\)[^;\n]*\.build\(/.test(src),
    "AttachmentBuilder must not use .build(); pass the buffer to the constructor only"
  );
});
