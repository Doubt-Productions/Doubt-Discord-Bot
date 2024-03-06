const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { time } = require("../../../functions");
const { profileImage } = require("discord-arts");
const badge = require("../../../schemas/badge");
const userConfig = require("../../../schemas/userConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get a user's information.")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user.").setRequired(false)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply();

    const user =
      interaction.options.getMember("user") ||
      interaction.guild.members.cache.get(interaction.user.id);

    if (!user) {
      await interaction.reply({
        content: "That user is not on the guild.",
      });

      return;
    }

    const roles = [];

    if (user.roles)
      user.roles.cache.forEach((role) => {
        if (role.id !== interaction.guild.roles.everyone.id)
          roles.push(`${role.toString()}`);
      });

    const u =
      (await userConfig.findOne({ user: user.id })) ||
      (await userConfig.create({ user: user.id }));

    let badges = [];
    let badgeURLs = [];

    for (let i = 0; i < u.badges.length; i++) {
      console.log(u.badges[i]);
      console.log(u);

      const bg = await badge.findOne({ id: u.badges[i] });

      if (!bg) continue;

      badges.push(client.emojis.cache.get(bg?.emoji)?.toString() || bg?.emoji);
      
    }

    console.log(badges);

    // console.log(badgeURLs);

    // const buffer = await profileImage(user.id, {
    //   customBadges: badgeURLs,
    //   presenceStatus: user.presence.status,
    //   customBackground: user.user.bannerURL({ format: "gif", size: 4096 }),
    // });

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
    ];

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("User info - " + user.user.globalName)
          .setThumbnail(user.displayAvatarURL())
          .setDescription(`${arr.join("\n")}`)
          .setColor("Blurple"),
      ],
    //   files: [new AttachmentBuilder(buffer, `${user.id}.png`)],
    });
  },
};
