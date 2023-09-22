const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  Colors,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { embed, log } = require("../../../functions");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("embedcreator")
    .setDescription("This creates a custom embed!")

    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Use a 6 digit hex code")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the embed to")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("The image of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("The thumbnail of the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("The footer of the embed")
        .setRequired(false)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const { options } = interaction;

    const channel = options.getChannel("channel");
    const title = options.getString("title");
    const description = options.getString("description");
    const color = options.getString("color");
    const image = options.getString("image");
    const thumbnail = options.getString("thumbnail");
    const footer = options.getString("footer");

    try {
      embed(
        title,
        description,
        color,
        footer,
        image,
        thumbnail,
        channel,
        interaction
      );
      return interaction.reply({
        content: `Successfully sent the embed to ${channel || `this channel`}`,
        ephemeral: true,
      });
    } catch (error) {
      log(error, "err");
    }
  },
};
