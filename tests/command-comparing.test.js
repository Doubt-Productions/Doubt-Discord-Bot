const { test } = require("node:test");
const assert = require("node:assert");
const commandComparing = require("../src/utils/commandComparing");
const {
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
} = require("discord.js");

function makeLocalCommand(permission) {
  return {
    data: new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Ban a user")
      .setDefaultMemberPermissions(permission)
      .toJSON(),
  };
}

test("commandComparing treats matching discord.js permissions as unchanged", () => {
  const local = makeLocalCommand(PermissionFlagsBits.BanMembers);
  const existing = {
    name: "ban",
    description: "Ban a user",
    options: [],
    defaultMemberPermissions: new PermissionsBitField(
      PermissionFlagsBits.BanMembers
    ).freeze(),
  };

  assert.strictEqual(commandComparing(existing, local), false);
});

test("commandComparing detects default_member_permissions changes", () => {
  const local = makeLocalCommand(PermissionFlagsBits.BanMembers);
  const existing = {
    name: "ban",
    description: "Ban a user",
    options: [],
    defaultMemberPermissions: new PermissionsBitField(
      PermissionFlagsBits.KickMembers
    ).freeze(),
  };

  assert.strictEqual(commandComparing(existing, local), true);
});

test("commandComparing treats null and missing permissions as equivalent", () => {
  const local = {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Ping")
      .toJSON(),
  };
  const existing = {
    name: "ping",
    description: "Ping",
    options: [],
    defaultMemberPermissions: null,
  };

  assert.strictEqual(commandComparing(existing, local), false);
});
