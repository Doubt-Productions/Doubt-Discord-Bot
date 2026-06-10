const { EmbedBuilder } = require("discord.js");
const config = require('../../config');
const { normalizeIdAllowlist } = require("../../utils/normalizeIdAllowlist");
const mConfig = require("../../messageConfig.json");
const getModals = require("../../utils/getModals");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.replied || interaction.deferred) return;

  const modals = getModals();

  try {
    const modalObject = modals.find(
      (modal) => modal.customId === interaction.customId
    );
    if (!modalObject) return;

    if (modalObject.devOnly) {
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

    if (modalObject.testMode) {
      if (interaction.guild.id !== config.handler.guildId) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (modalObject.userPermissions?.length) {
      for (const permission of modalObject.userPermissions) {
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

    if (modalObject.botPermissions?.length) {
      for (const permission of modalObject.botPermissions) {
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

    await modalObject.run(client, interaction);
  } catch (err) {
    console.error(
      `An error occurred while validating modal commands! ${err}`
    );
  }
};
