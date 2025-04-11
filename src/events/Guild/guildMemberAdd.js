const ExtendedClient = require("../../class/ExtendedClient");
const { Guild } = require("discord.js");
const config = require("../../config");
const welcomeSchema = require("../../schemas/welcomeSchema");
const { log } = require("../../functions");

module.exports = {
  event: "guildMemberAdd",
  once: false,
  /**
   *
   * @param {ExtendedClient} client
   * @param {import('discord.js').GuildMember} member
   * @returns
   */
  run: async (client, member) => {
    const guild = member.guild;

    if (guild.id !== config.handler.guildId) return;

    const data = await welcomeSchema.findOne({ Guild: guild.id });
    if (!data) return;

    const channel = guild.channels.cache.get(data.Channel);

    if (!channel) return;

    channel.send(
      `${data.Message.replace("{user}", member)
        .replace("{rules}", `<#${data.Rules}>`)
        .replace(`{server}`, `**${guild.name}**`)}`
    );

    const role = guild.roles.cache.get(data.MemberRole);
    const botRole = guild.roles.cache.get(data.BotRole);

    if (!role) return;
    if (!botRole) return;

    try {
      if (member.user.bot) {
        member.roles.add(botRole);
      } else if (!member.user.bot) {
        member.roles.add(role);
      }
    } catch (error) {
      return guild.channels
        .fetch(config.variables.channels.logs)
        .then((channel) => {
          channel.send(`Error: ${error}`);
          log(error, "err");
        });
    }
  },
};
