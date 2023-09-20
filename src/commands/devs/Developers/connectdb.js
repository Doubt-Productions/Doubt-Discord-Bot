const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/GuildSchema");
const { log } = require("../../../functions");
const mongoose = require("../../../handlers/mongoose");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("connectdb")
    .setDescription("Attempt to connect the DB."),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    try {
      await interaction.deferReply();
      await mongoose().catch((err) => {
        log(err, "err");
        interaction.editReply(
          "An error occurred while connecting to the database."
        );
      });
      interaction.editReply("Successfully connected to the database.");
    } catch (error) {
      log(error, "err");
      interaction.reply("An error occurred while connecting to the database.");
    }
  },
};
