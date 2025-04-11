const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  customId: "wcmGoBackBtn",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const goBackButton = new ButtonBuilder()
      .setCustomId("goBackBtn")
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary)


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
    const goBackRow = new ActionRowBuilder().addComponents(goBackButton);

    interaction.update({
      embeds: [embed],
      components: [welcomeRow, goBackRow],
    });
  },
};
