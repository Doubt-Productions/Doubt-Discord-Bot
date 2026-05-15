const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { log } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simleave")
    .setDescription("Simulates a user leaving the server!"),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    client.emit("guildMemberRemove", interaction.member);

    log(`Simulated a user leaving the server!`, "info");
    await interaction.reply({
      content: `Simulated a user leaving the server!`,
      ephemeral: true,
    });
  },
};
