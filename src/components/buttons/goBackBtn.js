const {
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "goBackBtn",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle(`Setup`)
      .setDescription(`Welcome to the setup!`)
      .setColor("Blurple")
      .addFields(
        {
          name: "Welcome",
          value:
            "Please use the command `/setup-welcome` to setup welcome system!",
          inline: true,
        },
        {
          name: "Ticket",
          value:
            "Please use the command `/setup-ticket` to setup ticket system!",
          inline: true,
        },
        {
          name: "Join-to-create",
          value:
            "Please use the command `/setup-jointocreate` to setup join to create system!",
          inline: true,
        }
      );

    const setupSSM = new StringSelectMenuBuilder()
      .setCustomId("setupSSM")
      .setPlaceholder("Select a setup")
      .addOptions([
        {
          label: "Welcome",
          value: "welcome",
          description: "Setup welcome system",
        },
        {
          label: "Ticket",
          value: "ticket",
          description: "Setup ticket system",
        },
        {
          label: "Join-to-create",
          value: "jtc",
          description: "Setup join to create system",
        },
      ]);

    const row = new ActionRowBuilder().addComponents(setupSSM);

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};
