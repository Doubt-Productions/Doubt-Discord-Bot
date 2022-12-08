const {
  ModalBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
} = require("discord.js");
const client = require("../../index");

module.exports = {
  data: {
    name: `fav-color`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    await interaction.reply({
      content: `Your favorite color is ${interaction.fields.getTextInputValue(
        "favColorInput"
      )}`
    });
  },
};
