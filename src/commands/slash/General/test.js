const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const { Profile } = require("discord-arts");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("A test command.")
    .toJSON(),
  /**
   *
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    // await interaction.reply("This is a test command!");
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const guild = interaction.guild;

    console.log();

    try {
      const timestamp = `<t:${
        Math.round(member.joinedTimestamp / 1000)
      }:D>`;

      return interaction.reply({
        content: `Welcome to the server! You joined on ${timestamp}`,
      });
    } catch (error) {
      console.error("Error generating welcome image:", error);
      throw error;
    }
  },
};
