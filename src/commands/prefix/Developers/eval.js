const { Message } = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

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
    const evaled = eval(args.join(" "));

    console.log(evaled);
    await message.reply({
      content: String(evaled),
    });
  },
};
