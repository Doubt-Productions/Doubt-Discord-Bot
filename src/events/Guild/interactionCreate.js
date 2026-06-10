const ExtendedClient = require("../../class/ExtendedClient");
const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  event: "interactionCreate",
  /**
   * Command execution and permission checks live in src/events/validations/.
   * This module intentionally does not run commands — registering both this
   * handler and the validator chain caused every slash command to execute twice.
   *
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (_client, _interaction) => {},
};
