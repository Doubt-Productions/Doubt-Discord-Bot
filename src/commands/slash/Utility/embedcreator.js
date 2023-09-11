const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  Colors
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("embedcreator")
    .setDescription("This creates a custom embed!")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the embed to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
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
        .setMaxLength(6)
        .setRequired(true)
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

    function isHexColor (hex) {
        return typeof hex === 'string'
            && hex.length === 6
            && !isNaN(Number('0x' + hex))
        }
    
        if (!isHexColor(color) && !Object.keys(Colors).includes(color.toUpperCase())) {
            interaction.reply('Please enter a valid HEX color to use'); return;
           }

    if (image && !image.startsWith("https://"))
      return interaction.reply({
        content: "The image must be a link!",
        ephemeral: true,
      });
    if (thumbnail && !thumbnail.startsWith("https://"))
      return interaction.reply({
        content: "The thumbnail must be a link!",
        ephemeral: true,
      });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(`${color}`)
      .setImage(image)
      .setThumbnail(thumbnail)
      .setFooter({
        text: `${footer||"Ariza Network"}`,
        iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setTimestamp();

    await interaction.reply({
        content: "Embed created!",
        ephemeral: true,
        });

    const reqChannel = interaction.guild.channels.cache.get(channel.id);

    await reqChannel.send({ embeds: [embed] });

  },
};
