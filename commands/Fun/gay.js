const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gay")
    .setDescription("How gay are you?")
    .setDefaultMemberPermissions()
    .addUserOption((option) =>
      option
        .setName(`target`)
        .setDescription(`The user you want to target`)
        .setRequired(false)
    ),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { guild, member, options } = interaction;

    const percentage = Math.floor(Math.random() * 100) + 1;

    const target = options.getUser("target") || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Gay Test`)
      .setDescription(`I have found them to be **${percentage}%** gay`)
      .setColor(`Random`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
