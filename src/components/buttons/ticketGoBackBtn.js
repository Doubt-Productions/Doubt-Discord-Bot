const {
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "ticketGoBackBtn",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const goBackBtn = new ButtonBuilder()
      .setCustomId("goBackBtn")
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary);

    const goBackRow = new ActionRowBuilder().addComponents(goBackBtn);

    const ticketSSM = new StringSelectMenuBuilder()
      .setCustomId("ticketSSM")
      .setPlaceholder("Select a setup")
      .addOptions([
        {
          label: "Category",
          value: "category",
          description: "Message to send!",
          emoji: "📂",
        },
        {
          label: "Channel",
          value: "channel",
          description: "Channel to send welcome message!",
          emoji: "📌",
        },
        {
          label: "Support Role",
          value: "support-role",
          description: "Channel to send rules and info!",
          emoji: "🛠️",
        },
      ]);

    const ticketRow = new ActionRowBuilder().addComponents(ticketSSM);

    const embed2 = new EmbedBuilder()
      .setTitle(`🎫 | Ticket System`)
      .setDescription(`Welcome to the ticket setup!`)
      .setColor("Blurple")
      .addFields(
        {
          name: "Category",
          value: "Please select a category!",
          inline: true,
        },
        {
          name: "Channel",
          value: "Please select a channel!",
          inline: true,
        },
        {
          name: "Support Role",
          value: "Please select a support role!",
          inline: true,
        }
      );

    await interaction.update({
      embeds: [embed2],
      components: [ticketRow, goBackRow],
    });
  },
};
