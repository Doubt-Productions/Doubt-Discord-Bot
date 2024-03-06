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
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */ run: async (client, interaction, args) => {
    const memberId = interaction.options.getMember(`user`);

    await interaction.guild.bans.remove(
      memberId,
      `Ban removed by ${interaction.user.tag}!`
    );
  },
};
