const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const mConfig = require("../messageConfig.json");

/**
 * @param {import("discord.js").Interaction} interaction
 * @returns {Promise<boolean>}
 */
async function denyUnlessManageGuild(interaction) {
  if (
    !interaction.inGuild() ||
    !interaction.member?.permissions?.has(PermissionFlagsBits.ManageGuild)
  ) {
    const rEmbed = new EmbedBuilder()
      .setColor(`${mConfig.embedColorError}`)
      .setDescription(`${mConfig.userNoPermissions}`);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [rEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    return false;
  }

  return true;
}

/**
 * @param {import("discord.js").Interaction} interaction
 * @param {string} customId
 * @returns {(i: import("discord.js").Interaction) => boolean}
 */
function setupComponentFilter(interaction, customId) {
  return (i) => i.user.id === interaction.user.id && i.customId === customId;
}

module.exports = { denyUnlessManageGuild, setupComponentFilter };
