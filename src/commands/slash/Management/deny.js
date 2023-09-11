const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("deny")
    .setDescription("Deny a user's application!"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {},
};
