/**
 * Regression: partial welcome setup (channel without message) must not crash
 * guildMemberAdd on join. PR #165 modal flow allows saving channel independently.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("guildMemberAdd guards null welcome message before replace", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/events/Guild/guildMemberAdd.js"),
    "utf8"
  );

  assert.ok(
    src.includes("if (data.Message)") &&
      /data\.Message\.replace/.test(src),
    "expected welcome send to be gated on data.Message before calling replace"
  );
  assert.ok(
    !/data\.Message\.replace/.test(src.split("if (data.Message)")[0] || ""),
    "expected no unguarded data.Message.replace before the null check"
  );
});
