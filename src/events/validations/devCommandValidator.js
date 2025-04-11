const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
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

    if (commandObject.devOnly) {
      if (!config.moderation.developers.includes(interaction.member.id)) {
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
    console.log(
      `An error occurred while validating chat input commands! ${err}`.red
    );
    console.log(err);
  }
};
