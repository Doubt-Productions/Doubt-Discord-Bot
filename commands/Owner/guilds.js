const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guilds")
    .setDescription("Get a list of all guilds the bot is in.")
    .setDefaultMemberPermissions(0),
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const guilds = client.guilds.cache.map((guild) => guild.name);
    const embed = new EmbedBuilder()
      .setTitle("Guilds")
      .setDescription(guilds.join("\n"))
      .setColor("Random")
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
