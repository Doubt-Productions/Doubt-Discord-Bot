const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");
const config = require("../../config");

module.exports = {
  event: "interactionCreate",
  /**
   * @param {ExtendedClient} client
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.replied || interaction.deferred) return;
    if (config.handler.commands.slash === false) return;

    const command =
      client.collection.interactioncommands.get(interaction.commandName) ||
      client.collection.developercommands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.run(client, interaction);
    } catch (error) {
      log(error, "err");
    }
  },
};
