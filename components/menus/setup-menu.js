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
    name: "setup-menu",
  },
  /**
   *
   * @param {SelectMenuInteraction} interaction
   * @param {*} client
   */
  async execute(interaction, client) {
    const { guild, member, user, values } = interaction;
    const value = values[0];
    switch (value) {
      case "logging":
        const modal = new ModalBuilder()
          .setTitle("Logging")
          .setCustomId("logging-modal");
        const channelInput = new TextInputBuilder()
          .setCustomId("logging-channel")
          .setLabel("Channel ID")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(channelInput));

        await interaction.showModal(modal);

        break;

      case "automod": {
        const embed = new EmbedBuilder()
          .setTitle("Auto-Mod")
          .setDescription(
            "Please select an option from the dropdown menu below."
          )
          .setColor("Random")
          .addFields([
            {
              name: "Anti-Scam",
              value: "Setup the Anti-Invite system.",
              inline: true,
            },
            {
              name: "Anti-Link",
              value: "Setup the Anti-Link system.",
              inline: true,
            },
            {
              name: "Anti-Word",
              value: "Setup the Anti-Word system.",
              inline: true,
            },
            {
              name: "Anti-NSFW",
              value: "Setup the Anti-NSFW system.",
              inline: true,
            },
          ]);

        interaction.reply({
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(
              new SelectMenuBuilder()
                .setCustomId("automod-menu")
                .setPlaceholder("Please select an option")
                .addOptions([
                  {
                    label: "Anti Phishing",
                    value: "antiphishing",
                    description: "Setup the Anti Phishing system.",
                    emoji: {
                      name: "🚫",
                    },
                  },
                  {
                    label: "Anti-Link",
                    value: "antilink",
                    description: "Setup the Anti-Link system.",
                    emoji: {
                      name: "🔗",
                    },
                  },
                  {
                    label: "Anti-Spam",
                    value: "antispam",
                    description: "Setup the Anti-spam system.",
                    emoji: {
                      name: "🔤",
                    },
                  },
                  {
                    label: "Anti-Caps",
                    value: "anticaps",
                    description: "Setup the Anti-Caps system.",
                    emoji: {
                      name: "🔠",
                    },
                  },
                  {
                    label: "Anti-Mass-Mention",
                    value: "antimassmention",
                    description: "Setup the Anti-Mass-Mention system.",
                    emoji: {
                      name: "📢",
                    },
                  },
                ])
            ),
          ],
        });
        break;
      }

      default:
        break;
    }
  },
};
