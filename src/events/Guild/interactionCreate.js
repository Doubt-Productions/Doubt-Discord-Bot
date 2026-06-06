const config = require("../../config");
const ExtendedClient = require("../../class/ExtendedClient");
const { ChatInputCommandInteraction } = require("discord.js");

/**
 * Slash and context menu commands are executed only after the validation chain in
 * src/events/validations (permission checks, dev gates, etc.). Invoking the command
 * entry point here as well caused every handler to fire twice (e.g. /eval twice).
 *
 * This listener keeps feature toggles so disabled command types short-circuit before validators.
 */
module.exports = {
  event: "interactionCreate",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.replied || interaction.deferred) return;

    if (
      config.handler.commands.slash === false &&
      interaction.isChatInputCommand()
    )
      return;
    if (
      config.handler.commands.user === false &&
      interaction.isUserContextMenuCommand()
    )
      return;
    if (
      config.handler.commands.message === false &&
      interaction.isMessageContextMenuCommand()
    )
      return;

    // Chat input and context menus: validations/* invoke each command once.
    if (
      interaction.isChatInputCommand() ||
      interaction.isContextMenuCommand()
    ) {
      return;
    }
  },
};
