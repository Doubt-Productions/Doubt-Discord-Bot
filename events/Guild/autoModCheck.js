const { PermissionFlagsBits, Message } = require("discord.js");
const client = require("../../index");
const AutoModSchema = require("../../Systems/models/AutoMod");
const stopPhishing = require("stop-discord-phishing");
const AntiSpam = require("discord-anti-spam");

module.exports = {
  name: "autoModCheck",
};

client.on(
  "messageCreate",
  /**
   *
   * @param {Message} message
   * @returns
   */
  async (message) => {
    // Check if the message was sent in a guild
    if (!message.guild) return;

    // Check if the message was sent by a bot
    if (message.author.bot) return;

    // Anti Link System
    const AutoMod = await AutoModSchema.findOne({
      Guild: message.guild.id,
    });

    if (AutoMod.AntiLink === true) {
      if (
        message.content.includes("http://") ||
        message.content.includes("https://") ||
        message.content.includes("www.") ||
        message.content.includes("discord.gg/") ||
        message.content.includes("discord.com/invite")
      ) {
        if (
          !message.member.permissions.has(PermissionFlagsBits.ManageMessages)
        ) {
          message.delete();
          message.channel.send(
            `**${message.author.username}**, Links are not allowed in this server!`
          );
        }
      }
    } else {
      return;
    }

    // Anti Phishing System
    if (AutoMod.AntiPhishing === true) {
      /**
       *
       * @param {message} message
       */
      async function checkMessage(message) {
        let isGrabber = await stopPhishing.checkMessage(message);
        if (isGrabber) {
          message.delete();
          message.author
            .send(
              `**${message.author.username}**, You have been banned from **${message.guild.name}** for sending a phishing link!`
            )
            .catch((err) =>
              message.reply(
                `Couldn't send message to the user because their dms are closed.`
              )
            );
          message.guild.members.cache
            .get(message.author.id)
            .ban({ reason: "Caught in the Anti Phishing System", days: 7 });
          const channel = message.guild.channels.cache.get(
            AutoMod.AntiPhishingChannel
          );
          channel.send(
            `**${message.author}** was banned for sending a phishing link!`
          );
        }
      }

      checkMessage(message);
    } else return;

    // Anti Spam System
    if (AutoMod.AntiSpam === true) {
      const antiSpam = new AntiSpam({
        warnThreshold: 3,
        muteTreshold: 6, 
        kickTreshold: 9, 
        banTreshold: 12, 
        warnMessage: "Stop spamming!", 
        muteMessage: "You have been muted for spamming!", 
        kickMessage: "You have been kicked for spamming!",
        banMessage: "You have been banned for spamming!",
        unMuteTime: 60,
        verbose: false,
        removeMessages: true,
        ignoredPermissions: [PermissionFlagsBits.Administrator],
        modLogsEnabled: true,
        modLogsChannel: AutoMod.AntiSpamChannel,
      });

      antiSpam.message(message);
    } else return;
  }
);
