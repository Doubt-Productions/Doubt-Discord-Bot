const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
} = require("discord.js");
const akinator = require("discord.js-akinator");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("akinator")
    .setDescription("Play a game of akinator"),
  category: "General",
  /**
   *
   * @param {Client} client
   * @param {*} interaction
   * @param {*} config
   * @returns
   */
  run: async (client, interaction, config) => {
    return akinator(interaction, {
      language: "en",
      childMode: false,
      gameType: "character",
      useButtons: true,
      embedColor: "Random",
    });
  },
};
