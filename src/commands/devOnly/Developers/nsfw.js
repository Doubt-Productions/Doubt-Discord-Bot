const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/GuildSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("Nsfw command."),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  options: {
    nsfw: true,
    staffOnly: true,
  },
  run: async (client, interaction, args) => {
    await interaction.reply({ content: "NSFW Command!" });
  },
};
