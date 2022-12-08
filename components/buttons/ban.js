const {
  ButtonInteraction,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const client = require("../../index");
const moderateSchema = require("../../Systems/models/Moderations");

module.exports = {
  data: {
    name: "ban",
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {client} client
   * @param {moderate} moderate
   *
   */
  async execute(interaction, client, moderate) {
    let msg = await interaction.reply({
      content: `This ain't your command, get out of here!`,
      ephemeral: true,
      fetchReply: true,
    });
    let collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on(
      "collect",
      /**
       *
       * @param {interaction} btnInteraction
       */
      async (btnInteraction) => {
        const modal = new ModalBuilder()
          .setTitle(`Ban a user`)
          .setCustomId("ban-modal");
        const textInput = new TextInputBuilder()
          .setCustomId("ban-reason")
          .setLabel("Reason")
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(textInput));

        await btnInteraction.showModal(modal);
      }
    );
  },
};
