const {
  SelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  SelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  data: {
    name: "automod-menu",
  },
  /**
   *
   * @param {SelectMenuInteraction} interaction
   * @param {*} client
   *
   */
  async execute(interaction, client) {
    const { guild, member, user, values } = interaction;
    const value = values[0];
    switch (value) {
      case "antiphishing": {
        const modal = new ModalBuilder()
          .setTitle("Anti Phishing")
          .setCustomId("antiphishing-modal");
        const enabledInput = new TextInputBuilder()
          .setCustomId("antiphishing-enabled")
          .setLabel("True/False")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);
        const channelInput = new TextInputBuilder()
          .setCustomId("antiphishing-channel")
          .setLabel("Channel ID")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(enabledInput));
        modal.addComponents(new ActionRowBuilder().addComponents(channelInput));

        await interaction.showModal(modal);

        break;
      }
      case "antilink": {
        const modal = new ModalBuilder()
          .setTitle("Anti-Link")
          .setCustomId("antilink-modal");
        const enabledInput = new TextInputBuilder()
          .setCustomId("antilink-enabled")
          .setLabel("True/False")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(enabledInput));

        await interaction.showModal(modal);

        break;
      }

      case "antispam": {
        const modal = new ModalBuilder()
          .setTitle("Anti-Spam")
          .setCustomId("antispam-modal");
        const enabledInput = new TextInputBuilder()
          .setCustomId("antispam-enabled")
          .setLabel("True/False")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);
        const channelInput = new TextInputBuilder()
          .setCustomId("antispam-channel")
          .setLabel("Channel ID")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        modal.addComponents(
          new ActionRowBuilder().addComponents(enabledInput),
          new ActionRowBuilder().addComponents(channelInput)
        );

        await interaction.showModal(modal);
      }
    }
  },
};
