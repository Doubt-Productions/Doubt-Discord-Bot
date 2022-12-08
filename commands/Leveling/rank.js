const {
  EmbedBuilder,
  AttachmentBuilder,
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const Levels = require("discord-xp");
const Config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("View your rank.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select the user")
        .setRequired(false)
    ),
  category: "Leveling",
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {Config} config
   
   * @returns
   */
  run: async (client, interaction, config, db) => {
    const canvacord = require("canvacord");

    const target = interaction.options.getMember("user") || interaction.user; // Grab the target.

    const user = await Levels.fetch(target.id, interaction.guild.id, true); // Selects the target from the database.
    if (!user)
      return interaction.reply(
        `Seems like ${target.user.username} has not earned any xp so far.`
      ); // If there isnt such user in the database, we send a message in general.

    const rank = new canvacord.Rank() // Build the Rank Card
      .setAvatar(target.displayAvatarURL({ format: "png", size: 512 }))
      .setCurrentXP(user.cleanXp) // Current User Xp
      .setRequiredXP(user.cleanNextLevelXp) // We calculate the required Xp for the next level
      .setRank(user.position) // Position of the user on the leaderboard
      .setLevel(user.level) // Current Level of the user
      .setProgressBar("#FFFFFF")
      .setUsername(target.username)
      .setDiscriminator(target.discriminator);

    rank.build().then((data) => {
      const attachment = new AttachmentBuilder(data, "RankCard.png");
      interaction.reply({ files: [attachment] });
    });
  },
};
