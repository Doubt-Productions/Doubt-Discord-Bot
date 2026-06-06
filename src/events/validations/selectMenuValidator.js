const { EmbedBuilder, Client } = require("discord.js");
const config = require("../../config");
const { normalizeIdAllowlist } = require("../../utils/normalizeIdAllowlist");
const mConfig = require("../../messageConfig.json");
const getSelects = require("../../utils/getSelects");

/**
 *
 * @param {Client} client
 * @param {import("discord.js").AnySelectMenuInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
  if (!interaction.isAnySelectMenu()) return;
  if (interaction.replied || interaction.deferred) return;
  const selects = getSelects();

  try {
    const selectObject = selects.find(
      (select) => select.customId === interaction.customId
    );
    if (!selectObject) return;

    if (selectObject.devOnly) {
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

    if (selectObject.testMode) {
      if (interaction.guild.id !== config.handler.guildId) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.commandTestMode}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    if (selectObject.userPermissions?.length) {
      for (const permission of selectObject.userPermissions) {
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

    if (selectObject.botPermissions?.length) {
      for (const permission of selectObject.botPermissions) {
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

    if (interaction.message.interaction) {
      if (interaction.message.interaction.user.id !== interaction.user.id) {
        const rEmbed = new EmbedBuilder()
          .setColor(`${mConfig.embedColorError}`)
          .setDescription(`${mConfig.cannotUseSelect}`);
        interaction.reply({ embeds: [rEmbed], ephemeral: true });
        return;
      }
    }

    await selectObject.run(client, interaction);
  } catch (err) {
    console.error(`An error occurred while validating select menus! ${err}`);
  }
};
