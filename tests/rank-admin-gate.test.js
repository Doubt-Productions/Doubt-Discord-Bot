/**
 * Regression: /rank reset and /rank set mutate XP without a permission gate.
 * Any member could reset or set another user's level after the security pass
 * added gates to moderation commands but omitted rank admin subcommands.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

test("rank reset and set require ManageGuild before database writes", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../src/commands/slash/General/rank.js"),
    "utf8"
  );

  assert.ok(
    src.includes("denyUnlessManageGuild"),
    "expected rank admin subcommands to use denyUnlessManageGuild"
  );

  const resetIdx = src.indexOf('case "reset"');
  const setIdx = src.indexOf('case "set"');
  assert.ok(resetIdx !== -1 && setIdx !== -1, "expected reset and set cases");

  const resetBlock = src.slice(resetIdx, setIdx);
  const setBlock = src.slice(setIdx, src.indexOf("default:"));

  assert.ok(
    resetBlock.includes("denyUnlessManageGuild"),
    "expected reset subcommand to gate on ManageGuild"
  );
  assert.ok(
    setBlock.includes("denyUnlessManageGuild"),
    "expected set subcommand to gate on ManageGuild"
  );
});
