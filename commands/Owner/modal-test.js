const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
} = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modal-test")
    .setDefaultMemberPermissions(0)
    .setDescription("Test a modal."),
  category: "Owner",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    if (interaction.user.id !== config.Users.ADMINS) return;

    const modal = new ModalBuilder()
      .setTitle("Modal Test")
      .setCustomId("fav-color");

    const textInput = new TextInputBuilder()
      .setCustomId("favColorInput")
      .setLabel("Favorite Color?")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(textInput));

    await interaction.showModal(modal);
  },
};
