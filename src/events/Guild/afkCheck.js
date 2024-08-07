const afkSchema = require("../../schemas/afkSchema");
const config = require("../../config");
const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");
const { Message } = require("discord.js");

module.exports = {
  event: "messageCreate",
  /**
   *
   * @param {ExtendedClient} client
   * @param {Message} interaction
   * @returns
   */
  run: async (client, message) => {
    if (message.author.bot) return;

    const check = await afkSchema.findOne({
      Guild: message.guildId,
      User: message.author.id,
    });

    if (check) {
      const nick = check.Nickname;

      await afkSchema.deleteMany({
        Guild: message.guildId,
        User: message.author.id,
      });

      await message.member.setNickname(`${nick}`).catch((err) => {
        return;
      });

      const m1 = await message.reply({
        content: `Welcome back ${message.author}, I have removed your afk!`,
      });
      setTimeout(() => {
        m1.delete();
      }, 4000);
    } else {
      const members = message.mentions.members.first();
      if (!members) return;

      const Data = await afkSchema.findOne({
        Guild: message.guildId,
        User: members.id,
      });

      if (!Data) return;

      const member = message.guild.members.cache.get(members.id);
      const msg = Data.Message || "No reason provided.";

      const embed = new EmbedBuilder()
        .setTitle(`👋 ${member.displayName} is afk!`)
        .setDescription(`Reason: ${msg}`)
        .setColor(`Blurple`)
        .setTimestamp();

      if (message.content.includes(members)) {
        const m = await message.reply({
          embeds: [embed],
          content: `${message.author}`,
        });
        setTimeout(() => {
          m.delete();
        }, 10000);
      }
    }
  },
};
