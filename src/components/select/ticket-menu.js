const {
  StringSelectMenuInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const ticketSchema = require("../../schemas/ticketSchema");

module.exports = {
  customId: "ticket",
  /**
   *
   * @param {ExtendedClient} client
   * @param {StringSelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    const modal = new ModalBuilder()
      .setTitle("Please enter more information!")
      .setCustomId("ticket-modal");

    const reason = new TextInputBuilder()
      .setCustomId("reason")
      .setRequired(true)
      .setLabel(`Please enter more details.`)
      .setPlaceholder(`Start typing here`)
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(reason);

    modal.addComponents(firstActionRow);

    let choices;

    choices = interaction.values;

    const result = choices.join("");

    const data = await ticketSchema.findOne({ Guild: interaction.guild.id });

    const filter = { Guild: interaction.guild.id };
    const update = { Ticket: result };

    await ticketSchema.updateOne(
      {
        Guild: interaction.guild.id,
      },
      {
        Ticket: result,
      },
      {
        new: true,
      }
    );

    interaction.showModal(modal);
  },
};
