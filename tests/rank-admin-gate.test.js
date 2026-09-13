/**
 * Regression: /rank reset and /rank set had no permission gate; any member
 * could wipe or inflate XP.
 */
const { test } = require("node:test");
const assert = require("node:assert");
const { PermissionFlagsBits } = require("discord.js");

function rankAdminGate(memberPermissions, subcommand) {
  if (subcommand !== "reset" && subcommand !== "set") {
    return { action: "allow" };
  }

  if (!memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return { action: "deny", reason: "manage-guild-required" };
  }

  return { action: "allow" };
}

test("rank info is allowed without ManageGuild", () => {
  const perms = new Set();
  assert.deepStrictEqual(rankAdminGate(perms, "info"), { action: "allow" });
});

test("rank reset is denied without ManageGuild", () => {
  const perms = new Set();
  assert.deepStrictEqual(rankAdminGate(perms, "reset"), {
    action: "deny",
    reason: "manage-guild-required",
  });
});

test("rank set is denied without ManageGuild", () => {
  const perms = new Set();
  assert.deepStrictEqual(rankAdminGate(perms, "set"), {
    action: "deny",
    reason: "manage-guild-required",
  });
});

test("rank reset is allowed with ManageGuild", () => {
  const perms = new Set([PermissionFlagsBits.ManageGuild]);
  assert.deepStrictEqual(rankAdminGate(perms, "reset"), { action: "allow" });
});
