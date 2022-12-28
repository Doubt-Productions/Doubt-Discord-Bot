const {
  StringSelectMenuInteraction,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: {
    name: "setup-menu",
  },
  /**
   *
   * @param {StringSelectMenuInteraction} interaction
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
              name: "Anti-Swear",
              value: "Setup the Anti-Word system.",
              inline: true,
            },
            {
              name: "Anti-NSFW",
              value: "Setup the Anti-NSFW system.",
              inline: true,
            },
          ]);
        await interaction.reply({
          ephemeral: true,
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
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
                    label: "Anti-Swear",
                    value: "antiswear",
                    description: "Setup the Anti-Swear system.",
                    emoji: {
                      name: "🤬",
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
                  {
                    label: "Anti-Alt",
                    value: "antialt",
                    description: "Setup the Anti-Alt system.",
                    emoji: {
                      name: "🤖",
                    },
                  },
                ])
            ),
          ],
        });
        break;
      }

      case "suggestions": {
        const embed = new EmbedBuilder()
          .setTitle("Suggestions")
          .setDescription(
            "Please select an option from the dropdown menu below."
          )
          .setColor("Random")
          .addFields({
            name: "Channel",
            value: "Setup the suggestions channel.",
            inline: true,
          });
        await interaction.reply({
          ephemeral: true,
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId("suggestions-channel")
                .setPlaceholder("Select a channel")
                .setMinValues(1)
                .setMaxValues(1)
                .setChannelTypes(ChannelType.GuildText)
            ),
          ],
        });
        break;
      }

      default:
        return interaction.reply({
          content:
            "This option is currently unavailable. Please try again later.",
          ephemeral: true,
        });
        break;
    }
  },
};
