const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ticketSchema = require("../../../schemas/ticketSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Setup the ticket system!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the ticket system will be setup!")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("The category where the ticket system will be setup!")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role that can see the ticket system!")
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const channel = interaction.options.getChannel("channel");
    const category = interaction.options.getChannel("category");
    const role = interaction.options.getRole("role");

    const data = await ticketSchema.findOne({ Guild: interaction.guild.id });

    if (!data) {
      new ticketSchema({
        Guild: interaction.guild.id,
        Channel: category.id,
        Role: role.id,
        Ticket: "first",
      }).save();
    } else {
      data.Channel = category.id;
      data.Role = role.id;
      data.save();
      interaction.reply({
        content: `Successfully setup the ticket system in ${channel}!`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("Ticket System")
      .setDescription(`If you want to open a ticket, click the button below!`)
      .setTimestamp()
      .setFooter({ text: `${interaction.guild.name} ticket system` });

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket")
        .setPlaceholder("Select a reason")
        .addOptions([
          {
            label: "General",
            value: "General Support",
            description:
              "If you want to open a ticket for general support, click here!",
            emoji: "🧾",
          },
          {
            label: "Management",
            value: "Management Support",
            description:
              "If you want to open a ticket for management, click here!",
            emoji: "💼",
          },
          {
            label: "Other",
            value: "Other Support",
            description:
              "If you want to open a ticket for another reason, click here!",
            emoji: "📁",
          },
        ])
    );

    await channel.send({
      embeds: [embed],
      components: [menu],
    });

    await interaction.reply({
      content: `Successfully setup the ticket system in ${channel}!`,
      ephemeral: true,
    });
  },
};
