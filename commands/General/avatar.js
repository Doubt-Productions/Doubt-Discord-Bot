const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get a users avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the avatar of")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const user = interaction.options.getUser("user") || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  },
};
