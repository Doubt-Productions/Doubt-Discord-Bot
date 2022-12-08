const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ChannelType,
} = require("discord.js");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guildinfo")
    .setDescription("Get information about the current guild.")
    .setDefaultMemberPermissions(),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { guild } = interaction;
    const { name, id, preferredLocale, channels, roles, ownerId } = guild;

    const owner = await guild.members.fetch(ownerId);
    const createdAt = moment(guild.createdAt);

    const totalChannels = channels.cache.size;
    const categories = channels.cache.filter(
      (c) => c.type === ChannelType.GuildCategory
    ).size;
    const textChannels = channels.cache.filter(
      (c) => c.type === ChannelType.GuildText
    ).size;
    const voiceChannels = channels.cache.filter(
      (c) =>
        c.type === ChannelType.GuildVoice ||
        c.type === ChannelType.GuildStageVoice
    ).size;
    const threadChannels = channels.cache.filter(
      (c) =>
        c.type === ChannelType.PublicThread ||
        c.type === ChannelType.PrivateThread
    ).size;

    const memberCache = guild.members.cache;
    const all = memberCache.size;
    const bots = memberCache.filter((m) => m.user.bot).size;
    const users = all - bots;
    const onlineUsers = memberCache.filter(
      (m) => !m.user.bot && m.presence?.status === "online"
    ).size;
    const onlineBots = memberCache.filter(
      (m) => m.user.bot && m.presence?.status === "online"
    ).size;
    const onlineAll = onlineUsers + onlineBots;
    const rolesCount = roles.cache.size;

    const getMembersInRole = (members, role) => {
      return members.filter((m) => m.roles.cache.has(role.id)).size;
    };

    const rolesString = roles.cache
      .filter((r) => !r.name.includes("everyone"))
      .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
      .join(", ");

    let { verificationLevel } = guild;
    switch (guild.verificationLevel) {
      case "VERY_HIGH":
        verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
        break;

      case "HIGH":
        verificationLevel = "(╯°□°）╯︵ ┻�?┻";
        break;

      default:
        break;
    }

    let desc = "";
    desc = `${desc + "❯"} **Id:** ${id}\n`;
    desc = `${desc + "❯"} **Name:** ${name}\n`;
    desc = `${desc + "❯"} **Owner:** ${owner.user.tag}\n`;
    desc = `${desc + "❯"} **Region:** ${preferredLocale}\n`;
    desc += "\n";

    const embed = new EmbedBuilder()
      .setTitle("Guild Info")
      .setThumbnail(guild.iconURL())
      .setColor("DarkAqua")
      .setDescription(desc)
      .addFields(
        {
          name: `Server Members [${all}]`,
          value: `\`\`\`Members: ${users}\nBots: ${bots}\`\`\``,
          inline: true,
        },
        {
          name: `Online Users [${onlineAll}]`,
          value: `\`\`\`Users: ${onlineUsers}\nBots: ${onlineBots}\`\`\``,
          inline: true,
        },
        {
          name: `Categories and channels [${totalChannels}]`,
          value: `\`\`\`Categories: ${categories}\nText: ${textChannels}\nVoice: ${voiceChannels}\nThreads: ${threadChannels}\`\`\``,
          inline: true,
        },
        {
          name: `Roles [${rolesCount}]`,
          value: `\`\`\`${rolesString}\`\`\``,
          inline: true,
        },
        {
          name: "Verification Level",
          value: `\`\`\`${verificationLevel}\`\`\``,
          inline: true,
        },
        {
          name: "Boost Count",
          value: `\`\`\`${guild.premiumSubscriptionCount}\`\`\``,
          inline: true,
        },
        {
          name: `Created At [${createdAt.fromNow()}]`,
          value: `\`\`\`${createdAt.format("dddd, Do MMMM YYYY")}\`\`\``,
          inline: true,
        }
      )
      .setTimestamp();

    if (guild.splashURL) embed.setImage(guild.splashURL());

    interaction.reply({
      embeds: [embed],
    });
  },
};
