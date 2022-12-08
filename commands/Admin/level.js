const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Levels = require("discord-xp");
const DB = require("../../Systems/models/leveling");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Manage the leveling system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup((subcommand) =>
      subcommand
        .setName("admin")
        .setDescription("Manage the leveling system.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("setlevel")
            .setDescription("Set the level of a user.")
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user you want to set the level of.")
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("level")
                .setDescription("The level you want to set the user to.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("setxp")
            .setDescription("Set the xp of a user.")
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user you want to set the xp of.")
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("xp")
                .setDescription("The xp you want to set the user to.")
                .setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Enable or disable the leveling system.")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable the leveling system.")
            .setRequired(true)
        )
    ),
  category: "Admin",
  run: async (client, interaction, config, db) => {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "setlevel") {
      const target = interaction.options.getMember("user");
      const level = interaction.options.getInteger("level");

      await Levels.setLevel(target.id, interaction.guild.id, level);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Leveling System")
            .setDescription(
              `Successfully set ${target.user.username}'s level to ${level}.`
            ),
        ],
      });
    } else if (subCommand === "setxp") {
      const target = interaction.options.getMember("user");
      const xp = interaction.options.getInteger("xp");

      await Levels.setXp(target.id, interaction.guild.id, xp);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Leveling System")
            .setDescription(
              `Successfully set ${target.user.username}'s xp to ${xp}.`
            ),
        ],
      });
    } else if (subCommand === "setup") {
      const enabled = interaction.options.getBoolean("enabled");
      let data = await DB.findOne({ Guild: interaction.guild.id }).catch(
        (err) => {}
      );
      if (!data) {
        data = new DB({
          Guild: interaction.guild.id,
          Enabled: false,
        });
      }
      if (enabled === true) {
        data.Enabled = true;
        data.save();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Leveling System")
              .setDescription(`Successfully enabled the leveling system.`),
          ],
        });
      } else {
        data.Enabled = false;
        data.save();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Leveling System")
              .setDescription(`Successfully disabled the leveling system.`),
          ],
        });
      }
    }
  },
};
