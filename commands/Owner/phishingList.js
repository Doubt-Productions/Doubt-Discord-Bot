const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const stopPhishing = require("stop-discord-phishing");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("phishing-list")
    .setDescription(
      "Get an accurate list of all known phishing and scam links for testing purposes."
    )
    .setDefaultMemberPermissions(0),
  category: "Owner",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    if (!config.Users.ADMINS.includes(interaction.user.id)) return;
    const phishingLinks = await stopPhishing.listPhishingDomains();
    const susLinks = await stopPhishing.listSuspiciousDomains();

    console.log(phishingLinks);
    console.log(susLinks);
    await interaction.reply(`Posted to console`);
  },
};
