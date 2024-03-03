const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/GuildSchema");
const { embed } = require("../../../functions");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("testembed")
    .setDescription("Testing the embed function."),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  options: {
    developers: true,
  },
  run: async (client, interaction, args) => {
    return embed(
      "Test",
      "This is a test embed.",
      "Blurple",
      interaction
    );
  },
};
