const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
} = require("discord.js");
const moderateSchema = require("../../Systems/models/Moderations");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderate")
    .setDescription("Execute moderation actions on a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to moderate.")
        .setRequired(true)
    ),
  category: "Moderation",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const user = interaction.options.getUser("user");

    moderateSchema.findOne(
      { GuildID: interaction.guild.id },
      async (err, data) => {
        if (err) throw err;
        if (!data) {
          data = new moderateSchema({
            GuildID: interaction.guild.id,
            UserID: user.id,
            UserTag: user.tag,
          });
        }
        data.save();
      }
    );

    const embed = new EmbedBuilder()
      .setTitle("Moderate")
      .setDescription(
        `What moderation action would you like to execute on ${user.tag}?`
      )
      .setColor("Random");

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setCustomId("kick")
        .setLabel("Kick")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("👢"),
      new ButtonBuilder()
        .setCustomId("ban")
        .setLabel("Ban")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔨"),
      new ButtonBuilder()
        .setCustomId("timeout")
        .setLabel("Timeout")
        .setDisabled(false)
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔇"),
    ]);

    interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
