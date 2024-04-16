const {
  StringSelectMenuInteraction,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "setupSSM",
  /**
   *
   * @param {ExtendedClient} client
   * @param {StringSelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    const value = interaction.values[0];

    const goBackBtn = new ButtonBuilder()
      .setCustomId("goBackBtn")
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary);

    const goBackRow = new ActionRowBuilder().addComponents(goBackBtn);

    switch (value) {
      case "welcome":
        const embed = new EmbedBuilder()
          .setTitle(`Welcome System`)
          .setDescription(`Welcome to the welcome setup!`)
          .setColor("Blurple")
          .addFields(
            {
              name: "Channel",
              value: "Please select a channel!",
              inline: true,
            },
            {
              name: "Message",
              value: "Please select a message!",
              inline: true,
            },
            {
              name: "Rules Channel",
              value: "Please select a rules channel!",
              inline: true,
            },
            {
              name: "Member Role",
              value: "Please select a member role!",
              inline: true,
            },
            {
              name: "Bot Role",
              value: "Please select a bot role!",
              inline: true,
            }
          );

        const welcomeSSM = new StringSelectMenuBuilder()
          .setCustomId("welcomeSSM")
          .setPlaceholder("Select a setup")
          .addOptions([
            {
              label: "Channel",
              value: "channel",
              description: "Channel to send welcome message!",
              emoji: "📝",
            },
            {
              label: "Message",
              value: "message",
              description: "Message to send!",
              emoji: "🖋️",
            },
            {
              label: "Rules Channel",
              value: "rules-channel",
              description: "Channel to send rules and info!",
              emoji: "📜",
            },
            {
              label: "Member Role",
              value: "member-role",
              description: "Role to give to members!",
              emoji: "👥",
            },
            {
              label: "Bot Role",
              value: "bot-role",
              description: "Role to give to bots!",
              emoji: "🤖",
            },
          ]);

        const welcomeRow = new ActionRowBuilder().addComponents(welcomeSSM);
        await interaction.update({
          embeds: [embed],
          components: [welcomeRow, goBackRow],
        });

        break;
      case "ticket":
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

        break;
      case "jtc":
        break;
      default:
        await interaction.update({
          content: "Invalid option selected!",
        });
    }
  },
};
