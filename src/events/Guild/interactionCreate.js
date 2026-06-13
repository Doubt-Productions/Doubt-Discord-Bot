const ExtendedClient = require("../../class/ExtendedClient");
const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  event: "interactionCreate",
  /**
   * Slash and context-menu commands are validated and executed only by the
   * `src/events/validations/` interactionCreate chain. Running commands here
   * as well duplicated execution (economy corruption, double replies).
   *
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async () => {},
};
