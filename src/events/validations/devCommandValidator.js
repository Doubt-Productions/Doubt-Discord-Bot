const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const { normalizeIdAllowlist } = require("../../utils/normalizeIdAllowlist");
const mConfig = require("../../messageConfig.json");
const getLocalDevCommands = require("../../utils/getLocalDevCommands");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const localCommands = getLocalDevCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!commandObject) return;

    const requiresDeveloper =
      commandObject.devOnly === true ||
      commandObject.options?.developers === true;

    if (requiresDeveloper) {
      const developerIds = normalizeIdAllowlist(
        config.moderation?.developers
      );
      if (developerIds.length <= 0) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(
            `This is a developer only command, but unable to execute due to missing user IDs in configuration file.`
          );
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
      if (!developerIds.includes(interaction.user.id)) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandDevOnly}`);
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (commandObject.options?.staffOnly) {
      const member = interaction.member;
      const staffRoleIds = normalizeIdAllowlist(
        config.moderation?.staffRoles
      );
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

    if (commandObject.testMode) {
      if (!interaction.guild || interaction.guild.id !== config.handler.guildId) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandTestMode}`);
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (commandObject.userPermissions?.length) {
      if (!interaction.inGuild() || !interaction.member) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
      for (const permission of commandObject.userPermissions) {
        if (interaction.member.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.userNoPermissions}`);
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (commandObject.botPermissions?.length) {
      if (!interaction.inGuild() || !interaction.guild.members.me) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (bot.permissions.has(permission)) {
          continue;
        }
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.botNoPermissions}`);
        await interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    /** Command execution is handled only by Guild/interactionCreate.js to avoid duplicate runs and listener-order races. */
  } catch (err) {
    console.error(
      `An error occurred while validating chat input commands! ${err}`
    );
    console.error(err);
  }
};
