const {
  UserContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../class/ExtendedClient");

const badge = require("../schemas/badge");
const userConfig = require("../schemas/userConfig");
const { time } = require("../functions");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("info").setType(2),
  /**
   * @param {ExtendedClient} client
   * @param {UserContextMenuCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const user = interaction.options.getMember("user");

    await interaction.deferReply();

    if (!user) {
      await interaction.reply({
        content: "That user is not on the guild.",
      });

      return;
    }

    const u =
      (await userConfig.findOne({ user: user.id })) ||
      (await userConfig.create({ user: user.id }));

    let badges = [];
    let badgeURLs = [];

    for (let i = 0; i < u.badges.length; i++) {
      const bg = await badge.findOne({ id: u.badges[i] });

      if (!bg) continue;

      badges.push(client.emojis.cache.get(bg?.emoji)?.toString() || bg?.emoji);
      const badgeurls = client.emojis.cache
        .get(bg?.emojiId)
        ?.imageURL({ extension: `png` });

      badgeURLs.push(badgeurls);
    }

    const roles = [];

    if (user.roles)
      user.roles.cache.forEach((role) => {
        if (role.id !== interaction.guild.roles.everyone.id)
          roles.push(`${role.toString()}`);
      });

    const arr = [
      `**Username**: ${user.user.username}`,
      `**Display name**: ${user.displayName}`,
      `**ID**: ${user.id}`,
      `**Joined Discord**: ${time(user.user.createdTimestamp, "d")} (${time(
        user.user.createdTimestamp,
        "R"
      )})`,
      `**Joined server**: ${time(user.joinedTimestamp, "d")} (${time(
        user.joinedTimestamp,
        "R"
      )})`,
      `**Roles** [${user.roles?.cache?.size - 1}]: ${roles.join(", ")}`,
      `**In a voice channel?**: ${user.voice ? "Yes" : "No"}`,
      `**Guild owner?**: ${
        interaction.guild.ownerId === user.id ? "Yes" : "No"
      }`,
      `**Timed out?**: ${
        user.communicationDisabledUntilTimestamp ? "Yes" : "No"
      }`,
      `**Badges**: ${badges.join(", ") || "None"}`,
    ];

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("User info - " + user.displayName)
          .setThumbnail(user.displayAvatarURL())
          .setDescription(`${arr.join("\n")}`)
          .setColor("Blurple"),
      ],
    });
  },
};
