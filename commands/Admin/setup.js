const {
  EmbedBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  ComponentType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup different parts of the bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "Admin",
  run: async (client, interaction, config, db) => {
    const embed = new EmbedBuilder()
      .setTitle("Setup")
      .setDescription("Please select an option from the dropdown menu below.")
      .setColor("Random")
      .addFields([
        {
          name: "Logging",
          value: "Setup the logging system.",
          inline: true,
        },
        {
          name: "Leveling",
          value: "Setup the Leveling system.",
          inline: true,
        },
        {
          name: "Verification",
          value: "Setup the Verification system.",
          inline: true,
        },
        {
          name: "Tickets",
          value: "Setup the Ticketing System.",
          inline: true,
        },
      ]);

    interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder()
            .setCustomId("setup-menu")
            .setPlaceholder("Please select an option")
            .addOptions([
              {
                label: "Logging",
                value: "logging",
                description: "Setup the logging system.",
                emoji: {
                  name: "📝",
                },
              },
              {
                label: "Auto-Mod",
                value: "automod",
                description: "Setup the Auto-Mod system.",
                emoji: {
                  name: "🔨",
                },
              },
              {
                label: "Leveling",
                value: "leveling",
                description: "Setup the Leveling system.",
                emoji: {
                  name: "📈",
                },
              },
              {
                label: "Verification",
                value: "verification",
                description: "Setup the Verification system.",
                emoji: {
                  name: "🔐",
                },
              },
              {
                label: "Tickets",
                value: "tickets",
                description: "Setup the Ticketing System.",
                emoji: {
                  name: "🎫",
                },
              },
            ])
        ),
      ],
    });
  },
};
