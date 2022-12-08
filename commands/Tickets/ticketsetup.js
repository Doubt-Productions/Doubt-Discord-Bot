const {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
  SlashCommandBuilder,
} = require("discord.js");
const TicketSetup = require("../../Systems/models/TicketSetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketsetup")
    .setDescription("Setup the ticket system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the ticket message")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("The category to create tickets in")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption((option) =>
      option
        .setName("transcripts")
        .setDescription("The channel to send the transcripts to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName("handlers")
        .setDescription("The role to handle tickets")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of the ticket embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("firstbutton")
        .setDescription("Format: (Name), (Label), (Emoji)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("secondbutton")
        .setDescription("Format: (Name), (Label), (Emoji)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("thirdbutton")
        .setDescription("Format: (Name), (Label), (Emoji)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("fourthbutton")
        .setDescription("Format: (Name), (Label), (Emoji)")
        .setRequired(true)
    ),

  category: "Tickets",
  run: async (client, interaction, config) => {
    const { guild, options } = interaction;

    try {
      const channel = options.getChannel("channel");
      const transcripts = options.getChannel("transcripts");
      const category = options.getChannel("category");

      const handlers = options.getChannel("handlers");

      const description = options.getChannel("description");
      const firstbutton = options.getChannel("firstbutton").split(",");
      const secondbutton = options.getChannel("secondbutton").split(",");
      const thirdbutton = options.getChannel("thirdbutton").split(",");
      const fourthbutton = options.getChannel("fourthbutton").split(",");

      const emoji1 = firstbutton[2];
      const emoji2 = secondbutton[2];
      const emoji3 = thirdbutton[2];
      const emoji4 = fourthbutton[2];

      await TicketSetup.findOneAndUpdate(
        {
          GuildID: guild.id,
        },
        {
          Channel: channel.id,
          Category: category.id,
          transcripts: transcripts.id,
          Handlers: handlers.id,
          Description: description,
          Buttons: [
            firstbutton[0].toLowerCase(),
            secondbutton[0].toLowerCase(),
            thirdbutton[0].toLowerCase(),
            fourthbutton[0].toLowerCase(),
          ],
        },
        {
          new: true,
          upsert: true,
        }
      );

      const embed = new EmbedBuilder().setDescription(description);

      const button = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId(firstbutton[0].toLowerCase())
          .setLabel(firstbutton[1])
          .setStyle(ButtonStyle.Danger)
          .setEmoji(emoji1),
        new ButtonBuilder()
          .setCustomId(secondbutton[0].toLowerCase())
          .setLabel(secondbutton[1])
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(emoji2),
        new ButtonBuilder()
          .setCustomId(thirdbutton[0].toLowerCase())
          .setLabel(thirdbutton[1])
          .setStyle(ButtonStyle.Primary)
          .setEmoji(emoji3),
        new ButtonBuilder()
          .setCustomId(fourthbutton[0].toLowerCase())
          .setLabel(fourthbutton[1])
          .setStyle(ButtonStyle.Success)
          .setEmoji(emoji4)
      );

      await guild.channels.cache.get(channel.id).send({
        embeds: [embed],
        components: [button],
      });

      interaction.reply("Ticket message has been sent!");
    } catch (err) {
      console.log(err);
      const errEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`Something went wrong...`)
        .addFields({
          name: "Error",
          value: `\`\`\`${err}\`\`\``,
        });

      interaction.reply({ embeds: [errEmbed] });
    }
  },
};
