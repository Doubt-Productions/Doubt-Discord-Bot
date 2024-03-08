const {
  UserContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

const badge = require("../../../schemas/badge");
const userConfig = require("../../../schemas/userConfig");
const { profileImage } = require("discord-arts");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("profile").setType(2),
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

    const buffer = await profileImage(user.id, {
      username: user.user.username,
      avatar: user.user.displayAvatarURL({ format: "png" }),
      customBadges: badgeURLs,
      background: user.user.bannerURL(),
      color: user.user.accentColor,
    });

    await interaction.editReply({
      files: [new AttachmentBuilder(buffer, `${user.id}.png`)],
    });
  },
};
