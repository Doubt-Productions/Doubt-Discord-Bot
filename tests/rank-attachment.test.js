const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rankSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "commands", "slash", "General", "rank.js"),
  "utf8"
);

test("rank info must not call AttachmentBuilder.build (removed in discord.js v14)", () => {
  assert.doesNotMatch(
    rankSource,
    /AttachmentBuilder\([^)]+\)\.build\(\)/,
    "AttachmentBuilder has no .build() in discord.js v14; using it crashes /rank info"
  );
});

test("rank info attaches the card buffer via AttachmentBuilder", () => {
  assert.match(
    rankSource,
    /new AttachmentBuilder\(data,\s*\{\s*name:\s*["']rank\.png["']\s*\}\)/,
    "expected rank card buffer wrapped in AttachmentBuilder"
  );
});
