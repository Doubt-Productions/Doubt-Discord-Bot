const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { log } = require("../../../functions");
const { connectPrisma } = require("../../../handlers/prisma");

module.exports = {
  data: new SlashCommandBuilder()
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
      await connectPrisma();
      await interaction.editReply({
        content: "Successfully connected to the database.",
      });
    } catch (error) {
      log(error, "err");
      try {
        await interaction.editReply({
          content: "An error occurred while connecting to the database.",
        });
      } catch (replyErr) {
        log(replyErr, "err");
      }
    }
  },
};
