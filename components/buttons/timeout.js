const {
  ButtonInteraction,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const client = require("../../index");
const moderateSchema = require("../../Systems/models/Moderations");

module.exports = {
  data: {
    name: "timeout",
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

    collector.on("collect", 
    /**
     * 
     * @param {interaction} btnInteraction 
     */
    async (btnInteraction) => {
      const modal = new ModalBuilder()
        .setTitle("Timeout a user")
        .setCustomId("timeout-modal");
      const reasonInput = new TextInputBuilder()
        .setCustomId("timeout-reason")
        .setLabel("Reason")
        .setMaxLength(512)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);
      const timeInput = new TextInputBuilder()
        .setCustomId("timeout-time")
        .setLabel("Time (e.g. 1h, 1d, 1w, up to 28d)")
        .setMinLength(1)
        .setMaxLength(3)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(reasonInput),
        new ActionRowBuilder().addComponents(timeInput)
      );

      await btnInteraction.showModal(modal);
    });
  },
};
