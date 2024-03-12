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

    switch (value) {
      case "welcome":
        const welcomeSSM = new StringSelectMenuBuilder()
          .setCustomId("welcomeSSM")
          .setPlaceholder("Select a setup")
          .addOptions([
            {
              label: "Channel",
              value: "channel",
              description: "Channel to send welcome message!",
            },
            {
              label: "Message",
              value: "message",
              description: "Message to send!",
            },
            {
              label: "Rules Channel",
              value: "rules-channel",
              description: "Channel to send rules and info!",
            },
            {
              label: "Member Role",
              value: "member-role",
              description: "Role to give to members!",
            },
            {
              label: "Bot Role",
              value: "bot-role",
              description: "Role to give to bots!",
            },
          ]);

        const goBackBtn = new ButtonBuilder()
          .setCustomId("goBackBtn")
          .setLabel("Go Back")
          .setStyle(ButtonStyle.Primary);

        const welcomeRow = new ActionRowBuilder().addComponents(welcomeSSM);
        const buttonRow = new ActionRowBuilder().addComponents(goBackBtn);

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

        await interaction.update({
          embeds: [embed],
          components: [welcomeRow, buttonRow],
        });

        break;
      case "ticket":
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
