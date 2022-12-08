const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ChatInputCommandInteraction,
} = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get info about a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to get info from")
        .setRequired(false)
    ),
  category: "",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    const { options, member, user, guild } = interaction;

    const target = options.getMember("user") || member;
    const { presence, roles } = target;
    const formatter = new Intl.ListFormat("en-GB", {
      style: "narrow",
      type: "conjunction",
    });

    await user.fetch();

    const statusType = {
      idle: "1FJj7pX.png",
      dnd: "fbLqSYv.png",
      online: "JhW7v9d.png",
      invisible: "dibKqth.png",
    };

    const activityType = [
      "🕹️ *Playing*",
      "🎧 *Listening to*",
      "📺 *Watching*",
      "🎙️ *Streaming*",
      "🧙‍♂️ *Custom*",
      "🏆 *Competing In*",
    ];

    const clientType = [
      { name: "desktop", text: "Computer", emoji: "💻" },
      { name: "mobile", text: "Mobile", emoji: "📱" },
      { name: "web", text: "Web", emoji: "🌐" },
      { name: "offline", text: "Offline", emoji: "💤" },
    ];

    const badges = {
      BugHunterLevel1: "<:BugHunter:1039182122663018557>",
      BugHunterLevel2: "<:bug_hunter_pog:1039182124663713853>",
      CertifiedModerator: "<:blurple_certified_moderator:1039182120666542191>",
      PremiumEarlySupporter: "<:early_supporter:1039182116837134407>",
      Hypesquad: "<:hypesquad:1039182104807874621>",
      HypeSquadOnlineHouse1: "<:hypesquad_bravery:1039182112198250556>",
      HypeSquadOnlineHouse2: "<:hypesquad_brilliance:1039182114026958960>",
      HypeSquadOnlineHouse3: "<:hypesquad_balance:1039182110252089454>",
      Partner: "<:DiscordPartner:1039182100793921536>",
      Staff: "<:DiscordStaff:1039182102802997278>",
      VerifiedBot: "<:verified_bot:1039182095928545300>",
      VerifiedDeveloper:
        "<:BadgeEarlyVerifiedBotDeveloper:1039182097950199838>",
    };

    const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
      let totalLength = 0;
      const result = [];

      for (const role of roles) {
        const roleString = `<@&${role.id}>`;

        if (roleString.length + totalLength > maxFieldLength) {
          break;
        }
        totalLength += roleString.length + 1;
        result.push(roleString);
      }

      return result.length;
    };

    const sortedRoles = roles.cache
      .map((role) => role)
      .sort((a, b) => b.position - a.position)
      .slice(0, roles.cache.size - 1);

    const clientStatus =
      presence?.clientStatus instanceof Object
        ? Object.keys(presence.clientStatus)
        : "offline";
    const userFlags = user.flags.toArray();

    const deviceFilter = clientType.filter((device) =>
      clientStatus.includes(device.name)
    );
    const devices = !Array.isArray(deviceFilter)
      ? new Array(deviceFilter)
      : deviceFilter;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(target.hexAccentColor || "DarkAqua")
          .setAuthor({
            name: `${target.user.tag}`,
            iconUrl: `https://i.imgur.com/${
              statusType[presence?.status || "invisible"]
            }`,
          })
          .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
          .setImage(target.user.bannerURL({ dynamic: true, size: 1024 }))
          .addFields(
            { name: "ID", value: user.id },
            {
              name: "Activities",
              value:
                presence?.activities
                  .map(
                    (activity) =>
                      `${activityType[activity.type]} ${activity.name}`
                  )
                  .join("\n") || "None",
            },
            {
              name: "Joined Server",
              value: `<t:${parseInt(target.user.joinedTimestamp / 1000)}:R>`,
            },
            {
              name: "Account Created",
              value: `<t:${parseInt(target.user.createdTimestamp / 1000)}:R>`,
            },
            { name: "Nickname", value: `${target.user.nickname || "None"}` },
            {
              name: `Roles (${maxDisplayRoles(sortedRoles)} of ${
                sortedRoles.length
              })`,
              value: `${
                sortedRoles.slice(0, maxDisplayRoles(sortedRoles)).join(" ") ||
                "None"
              }`,
            },
            {
              name: "Badges",
              value: userFlags.length
                ? formatter.format(userFlags.map((flag) => `${badges[flag]}`))
                : "None",
            },
            {
              name: "Devices",
              value: devices
                .map((device) => `${device.emoji} ${device.text}`)
                .join("\n"),
            },
            { name: "Profile Color", value: user.hexAccentColor || "None" },
            {
              name: "Boosting Server",
              value: roles.premiumSubscriberRole
                ? `Since <t:${parseInt(target.premiumSinceTimestamp / 1000)}:R>`
                : "No",
            },
            {
              name: "Banner",
              value: target.user.bannerURL() ? "** **" : "None",
            }
          ),
      ],
    });
  },
};
