const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reply")
    .setDescription("Reply to a specific suggestion.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName("token")
        .setDescription("The token of the suggestion you want to reply to.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reply")
        .setDescription("The reply you want to send to the suggestion.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("The status of the suggestion.")
        .setRequired(true)
        .addChoices(
          { name: "Approved", value: "Approved" },
          { name: "Denied", value: "Denied" },
          { name: "Discussing", value: "Discussing" }
        )
    ),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const stoken = interaction.options.getString("token");
    const reply = interaction.options.getString("reply");
    const status = interaction.options.getString("status");

    const Schema = require("../../Systems/models/Suggestions/suggestion");
    Schema.findOne(
      {
        token: stoken,
      },
      async (err, data) => {
        if (err) throw err;
        if (!data) return interaction.reply(`Invalid token!`);
        const message = data.message;
        const user = client.users.cache.get(data.user);
        const guild = data.guild;
        const suggestion = data.suggestion;
        const embed = new EmbedBuilder();

        if (interaction.guild.id !== guild)
          return interaction.reply(`Invalid token!`);
        const CSchema = require("../../Systems/models/Suggestions/channel");

        const c = await CSchema.findOne({ Guild: interaction.guild.id });
        const channel = c.Channel;
        const gchannel = interaction.guild.channels.cache.get(channel);
        if (!gchannel)
          return interaction.reply(
            `Couldn't find the suggestion channel! Does it exist?`
          );

        if (channel) {
          if (status === "Approved") {
            embed
              .setTitle("Suggestion")
              .setAuthor({
                name: `${user.username} | Reply`,
                iconURL: user.avatarURL(),
              })
              .setDescription(`**Suggestion:** ${suggestion}`)
              .addFields(
                { name: `Reply:`, value: reply },
                { name: "Status:", value: status, inline: true }
              )
              .setColor(`Green`)
              .setFooter({ text: `Token: ${stoken}` });
          } else if (status === "Denied") {
            embed
              .setTitle("Suggestion")
              .setAuthor({
                name: `${user.username} | Reply`,
                iconURL: user.avatarURL(),
              })
              .setDescription(`**Suggestion:** ${suggestion}`)
              .addFields(
                { name: `Reply:`, value: reply },
                { name: "Status:", value: status, inline: true }
              )
              .setColor(`Red`)
              .setFooter({ text: `Token: ${stoken}` });
          } else if (status === "Discussing") {
            embed
              .setTitle("Suggestion")
              .setAuthor({
                name: `${user.username} | Reply`,
                iconURL: user.avatarURL(),
              })
              .setDescription(`**Suggestion:** ${suggestion}`)
              .addFields(
                { name: `Reply:`, value: reply },
                { name: "Status:", value: status, inline: true }
              )
              .setColor(`Orange`)
              .setFooter({ text: `Token: ${stoken}` });
          }

          gchannel.messages.fetch(message).then((msg) => {
            msg.edit({ embeds: [embed] });
          });
          interaction.reply({
            content: `Successfully replied to the suggestion!`,
            ephemeral: true,
          });
        }
      }
    );
  },
};
