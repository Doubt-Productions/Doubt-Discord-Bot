const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const superagent = require("superagent");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("twitch")
    .setDescription("Get info about a twitch channel")
    .setDefaultMemberPermissions()
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("User to get info from")
        .setRequired(true)
    ),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { options, member } = interaction;
    const channelName = options.getString("user");

    try {
      const Response = superagent.get(
        `https://api.crunchprank.net/twitch/followcount/${channelName.toLowerCase()}`
      );

      const upTime = superagent.get(
        `https://api.crunchprank.net/twitch/uptime/${channelName.toLowerCase()}`
      );

      const totalViews = superagent.get(
        `https://api.crunchprank.net/twitch/total_views/${channelName.toLowerCase()}`
      );

      const accountage = superagent.get(
        `https://api.crunchprank.net/twitch/creation/${channelName.toLowerCase()}`
      );

      const lastGame = superagent.get(
        `https://api.crunchprank.net/twitch/game/${channelName.toLowerCase()}`
      );

      const avatarimg = superagent.get(
        `https://api.crunchprank.net/twitch/avatar/${channelName.toLowerCase()}`
      );

      const embed = new EmbedBuilder()
        .setTitle(`Twitch Stats for ${channelName}`)
        .setColor("e100ff")
        .setFields(
          {
            name: "Followers:",
            value: Response,
          },
          {
            name: "Uptime:",
            value: upTime,
          },
          {
            name: "Total Views",
            value: totalViews,
          },
          {
            name: "Account Age:",
            value: accountage,
          },
          {
            name: "Last Game:",
            value: lastGame,
          },
          {
            name: "Live:",
            value: upTime.text,
          }
        )
        .setThumbnail(`https://pngimg.com/uploads/twitch/twitch_PNG27.png`)
        .setURL(`https://twitch.tv/${channelName}`)
        .setImage(avatarimg.text)
        .setFooter({
          text: `Requested by ${member.user.tag}`,
          iconURL: member.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      interaction.reply({ embeds: [embed] }).catch((err) => {
        console.log(err);
        interaction.reply({
          content: `The user ${channelName} was not found. Please double check your input.`,
          ephermeal: true,
        });
      });
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "An error occured while trying to get the twitch channel",
        ephemeral: true,
      });
    }
  },
};
