const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const welcomeSchema = require("../../../schemas/welcomeSchema");
const chatbotSchema = require("../../../schemas/chatbotSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup command!")
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const embed = new EmbedBuilder()
      .setTitle(`Setup`)
      .setDescription(`Welcome to the setup!`)
      .setColor("Blurple")
      .addFields(
        {
          name: "Welcome",
          value:
            "Setup the welcome system using this option!",
          inline: true,
        },
        {
          name: "Ticket",
          value:
            "Setup the ticket system using this option!",
          inline: true,
        },
        {
          name: "Join-to-create",
          value:
            "This feature will be added at a later date.",
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
          emoji: "👋",
        },
        {
          label: "Ticket",
          value: "ticket",
          description: "Setup ticket system",
          emoji: "🎫",
        },
        // {
        //   label: "Join-to-create",
        //   value: "jtc",
        //   description: "Setup join to create system",
        //   emoji: "🔉",
        // },
      ]);

    const row = new ActionRowBuilder().addComponents(setupSSM);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
