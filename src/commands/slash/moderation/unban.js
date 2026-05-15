const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ms = require("ms");
const { log } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("unBan a user from the server!")
    .addStringOption((option) =>
      option
        .setName(`user`)
        .setDescription(`The user id to unban!`)
        .setRequired(true)
    )
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */   run: async (client, interaction) => {
    const userId = interaction.options.getString("user");

    try {
      await interaction.guild.bans.remove(
        userId,
        `Ban removed by ${interaction.user.tag}!`
      );
      await interaction.reply({
        content: `Successfully unbanned user \`${userId}\`.`,
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        content: `Failed to unban user \`${userId}\`. Make sure the ID is correct and the user is banned.`,
        ephemeral: true,
      });
    }
  },
};
