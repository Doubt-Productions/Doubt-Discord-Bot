/**
 * Regression: rob.js previously contained duplicate branches, undefined `amount`,
 * and a stray `else`, producing SyntaxError and preventing the bot from finishing
 * synchronous command loading (client.login never reached).
 *
 * Uses `node --check` so the suite does not need discord.js installed (pure parse).
 */
const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

test("rob slash command source parses (node --check)", () => {
  const robPath = path.join(
    __dirname,
    "..",
    "src",
    "commands",
    "slash",
    "Economy",
    "rob.js"
  );
  const r = spawnSync(process.execPath, ["--check", robPath], {
    encoding: "utf8",
  });
  assert.strictEqual(r.status, 0, r.stderr || r.stdout || "parse failed");
});
