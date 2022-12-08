const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const config = require("../../config/config.json");
const client = require("../../index");
const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get a link to invit the bot.")
    .setDefaultMemberPermissions(0),
  category: "General",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    if (!interaction.user.id === config.Users.ADMINS) {
      return interaction.reply({
        content: `❌ - This command is only available for bot administrators!`,
        ephemeral: true,
      });
    }
    
    const embed = new EmbedBuilder()
      .setTitle("Invite Link")
      .setDescription(`[Click here to invite the bot!](${config.Invite.link})`)
      .setColor("Aqua")
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
