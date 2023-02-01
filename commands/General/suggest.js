const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Send a suggestion.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The suggestion you want to send.")
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
    const suggestion = interaction.options.getString("query");
    const Schema = require("../../Systems/models/Suggestions/suggestion");
    const CSchema = require("../../Systems/models/Suggestions/channel");

    CSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (err) throw err;
      const pass = gen();
      const channel = interaction.guild.channels.cache.get(data.Channel);
      if (!data) return interaction.reply(`Suggestion system is not setup!`);
      if (data) {
        const embed = new EmbedBuilder()
          .setTitle("Suggestion")
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL(),
          })
          .setDescription(`**Suggestion:** ${suggestion}`)
          .addFields({ name: "Status", value: "Pending", inline: true })
          .setColor(`Orange`)
          .setFooter({ text: `Token: ${pass}` });

        channel
          .send({
            embeds: [embed],
          })
          .then((m) => {
            interaction.reply(`Suggestion sent!`);
            m.react("👍");
            m.react("👎");
            new Schema({
              message: m.id,
              token: pass,
              suggestion: suggestion,
              user: interaction.user.id,
              guild: interaction.guild.id,
            }).save();
          });
      }
    });
  },
};

function gen() {
  var length = 12,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; i++) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
