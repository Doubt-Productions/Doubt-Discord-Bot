const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { log } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staffonly")
    .setDescription("Tests if you are a staff member of the bot!"),
  options: {
    staffOnly: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    return interaction.reply({ content: `You are a staff member!` });
  },
};
