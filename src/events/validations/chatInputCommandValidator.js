const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const { normalizeIdAllowlist } = require("../../utils/normalizeIdAllowlist");
const {
  enforceApplicationCommandCooldown,
} = require("../../utils/applicationCommandCooldown");
const mConfig = require("../../messageConfig.json");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!commandObject) return;

    if (commandObject.options?.developers) {
      const developerIds = normalizeIdAllowlist(config.moderation?.developers);
      const developerCount = developerIds.length;

      if (developerCount <= 0) {
        await interaction.reply({
          content: `This is a developer only command, but unable to execute due to missing user IDs in configuration file.`,
          ephemeral: true,
        });
        return;
      }

      if (!developerIds.includes(interaction.user.id)) {
        await interaction.reply({
          content: `This is a developer only command.`,
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.options?.staffOnly) {
      const member = interaction.member;
      const staffRoleIds = normalizeIdAllowlist(config.moderation?.staffRoles);

      if (
        !member?.roles?.cache?.some((role) =>
          staffRoleIds.includes(role.id)
        )
      ) {
        await interaction.reply({
          content: `This is a staff only command.`,
          ephemeral: true,
        });
        return;
      }
    }

    if (
      commandObject.options?.nsfw &&
      interaction.inGuild() &&
      interaction.channel &&
      !interaction.channel.nsfw
    ) {
      await interaction.reply({
        content: "The current channel is not an NSFW channel.",
        ephemeral: true,
      });
      return;
    }

    if (
      !(await enforceApplicationCommandCooldown(
        interaction,
        commandObject.options?.cooldown
      ))
    ) {
      return;
    }

    if (commandObject.devOnly) {
      const developerIds = normalizeIdAllowlist(config.moderation?.developers);
      if (developerIds.length === 0) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
      if (!developerIds.includes(interaction.member.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandDevOnly}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (commandObject.testMode) {
      if (interaction.guild.id !== config.handler.guildId) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (commandObject.userPermissions?.length) {
      for (const permission of commandObject.userPermissions) {
        if (interaction.member.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (bot.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    await commandObject.run(client, interaction);
  } catch (err) {
    console.error(
      `An error occurred while validating chat input commands! ${err}`
    );
    console.error(err);
  }
};
