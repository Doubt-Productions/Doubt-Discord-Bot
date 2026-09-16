/**
 * Regression: discord-arts 0.7.x renamed profileImage → Profile.
 * Call sites must use the new export or profile commands throw at runtime.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("discord-arts exports Profile callable", () => {
  const { Profile, profileImage } = require("discord-arts");
  assert.strictEqual(typeof Profile, "function");
  assert.strictEqual(profileImage, undefined);
});

test("profile call sites import Profile, not profileImage", () => {
  const files = [
    "src/contextmenus/profile.js",
    "src/commands/slash/Info/userinfo.js",
  ];

  for (const rel of files) {
    const src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
    assert.match(src, /\bProfile\b/);
    assert.doesNotMatch(src, /profileImage/);
  }
});
