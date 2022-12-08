const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const Levels = require("discord-xp");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the server leaderboard."),
  category: "Leveling",
  run: async (client, interaction, config, db) => {
    const rawLeaderboard = await Levels.fetchLeaderboard(
      interaction.guild.id,
      10
    );

    if (rawLeaderboard.length < 1)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Leaderboard")
            .setDescription("Nobody's in leaderboard yet."),
        ],
      });

    const leaderboard = await Levels.computeLeaderboard(
      client,
      rawLeaderboard,
      true
    );

    const lb = leaderboard.map(
      (e) =>
        `**${e.position}.** ${e.username}#${e.discriminator}\nLevel: ${
          e.level
        } | XP: ${e.xp.toLocaleString()}`
    );

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Leaderboard")
          .setDescription(lb.join("\n\n")),
      ],
    });
  },
};
