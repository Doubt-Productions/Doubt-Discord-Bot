const {
  StringSelectMenuInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

const TICKET_MODAL_PREFIX = "ticket-modal:";

module.exports = {
  customId: "ticket",
  /**
   *
   * @param {ExtendedClient} client
   * @param {StringSelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    const subject = interaction.values.join("");

    const modal = new ModalBuilder()
      .setTitle("Please enter more information!")
      .setCustomId(`${TICKET_MODAL_PREFIX}${encodeURIComponent(subject)}`);

    const reason = new TextInputBuilder()
      .setCustomId("reason")
      .setRequired(true)
      .setLabel(`Please enter more details.`)
      .setPlaceholder(`Start typing here`)
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(reason);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
