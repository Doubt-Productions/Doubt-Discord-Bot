/**
 * Regression: validators must await interaction.reply on denial paths.
 * discord.js sets interaction.replied only after the reply HTTP call completes;
 * Guild execution handlers run in the same listener immediately after validators.
 * Fire-and-forget replies let commands/components run after a failed validation.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const validationsDir = path.join(__dirname, "../src/events/validations");

const mustAwaitReply = [
  "chatInputCommandValidator.js",
  "devCommandValidator.js",
  "buttonValidator.js",
  "selectMenuValidator.js",
  "ModalCommandValidator.js",
  "contextMenuCommandValidator.js",
];

for (const file of mustAwaitReply) {
  test(`${file} awaits interaction.reply on every denial path`, () => {
    const src = fs.readFileSync(path.join(validationsDir, file), "utf8");
    const lines = src.split("\n");
    for (const line of lines) {
      if (!line.includes("interaction.reply")) continue;
      assert.match(
        line,
        /\bawait\s+interaction\.reply\b/,
        `${file} must await interaction.reply before Guild handlers run: ${line.trim()}`
      );
    }
  });
}
