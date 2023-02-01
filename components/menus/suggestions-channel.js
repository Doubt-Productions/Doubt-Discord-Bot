const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelSelectMenuInteraction,
} = require("discord.js");
const channelSchema = require("../../Systems/models/Suggestions/channel");

module.exports = {
  data: {
    name: "suggestions-channel",
  },
  /**
   *
   * @param {ChannelSelectMenuInteraction} interaction
   * @param {*} client
   */
  async execute(interaction, client) {
    const channel = interaction.channels.first();
    const guild = interaction.guild;

    channelSchema.findOne({ Guild: guild.id }, async (err, data) => {
      if (err) throw err;
      if (data) {
        data.channel = Channel.id;
        data.save();
      } else if (!data) {
        new channelSchema({
          Guild: guild.id,
          Channel: channel.id,
        }).save();
      }
    });

    const embed = new EmbedBuilder()
      .setTitle("Suggestions Channel")
      .setDescription(`Set the suggestions channel to ${channel}`)
      .setColor("Green");

    interaction.reply({ embeds: [embed] });
  },
};
