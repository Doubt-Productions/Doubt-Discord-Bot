/**
 * Regression guards for high-severity correctness fixes.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

function readSrc(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

test("rank reset/set require ManageGuild permission", () => {
  const src = readSrc("src/commands/slash/General/rank.js");

  assert.ok(
    src.includes("PermissionFlagsBits.ManageGuild"),
    "rank reset/set must gate on ManageGuild"
  );
  assert.ok(
    src.includes('case "reset"') && src.includes('case "set"'),
    "expected reset and set subcommands"
  );
});

test("ban handles users who are not guild members", () => {
  const src = readSrc("src/commands/slash/moderation/ban.js");

  assert.ok(
    src.includes("getUser") && src.includes("member && !member.bannable"),
    "ban must not dereference null member"
  );
  assert.ok(
    !src.match(/member\s*\.send/),
    "ban should DM via user object, not member"
  );
  assert.ok(
    src.includes("guild.members.ban"),
    "ban should use guild.members.ban for users not in guild"
  );
});

test("kick rejects users who are not guild members", () => {
  const src = readSrc("src/commands/slash/moderation/kick.js");

  assert.ok(
    src.includes("if (!member)") && src.includes("!member.kickable"),
    "kick must guard null member before kickable check"
  );
});

test("deposit/withdraw must not use Math.abs to clamp balances", () => {
  const deposit = readSrc("src/commands/slash/Economy/deposit.js");
  const withdraw = readSrc("src/commands/slash/Economy/withdraw.js");

  assert.ok(!deposit.includes("Math.abs"), "deposit must not use Math.abs");
  assert.ok(!withdraw.includes("Math.abs"), "withdraw must not use Math.abs");
  assert.ok(
    deposit.includes("Data.Wallet < 0") && withdraw.includes("Data.Bank < 0"),
    "expected negative-balance guard instead of Math.abs"
  );
});
