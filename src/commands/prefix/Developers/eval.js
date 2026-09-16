const { Message } = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { safeEval } = require("../../../utils/safeEval");

module.exports = {
  data: {
    name: "eval",
    description: "Execute some codes!",
    aliases: ["e"],
    cooldown: 0,
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {Message} message
   * @param {[String]} args
   */
  run: async (client, message, args) => {
    try {
      const evaled = await safeEval(args.join(" "), { client, message });
      await message.reply({
        content: String(evaled).slice(0, 2000),
      });
    } catch (error) {
      await message.reply({
        content: `Eval failed: ${error.message}`,
      });
    }
  },
};
