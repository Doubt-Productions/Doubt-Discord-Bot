const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const customCommandModel = require("../../Systems/models/customCommands");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("custom")
    .setDescription("Create a custom command.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a custom command.")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("The name of the command.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("response")
            .setDescription("The response you want.")
            .setRequired(true)
        )
    ),
  category: "Admin",
  run: async (client, interaction, config, db) => {
    const subCommand = interaction.options.getSubcommand();
    const commandName = interaction.options.getString("command");
    const customCommand = await customCommandModel.findOne({ commandName });

    if (subCommand === "create") {
      const response = interaction.options.getString("response");

      if (!customCommand) {
      }
    }
  },
};
