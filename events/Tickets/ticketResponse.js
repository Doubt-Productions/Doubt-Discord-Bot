const {
  ChannelType,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const client = require("../../index");
const ticketSchema = require("../../Systems/models/tickets");
const TicketSetup = require("../../Systems/models/TicketSetup");

module.exports = {
  name: "ticketResponse",
};

client.on(
  "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async (interaction) => {
    const { guild, member, customId, channel } = interaction;
    const { ViewChannel, SendMessages, ManageChannel, ReadMessageHistory } =
      PermissionFlagsBits;
    const ticketId = Math.floor(Math.random() * 9000) + 10000;

    if (!interaction.isButton()) return;

    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (!data) return;

    if (!data.Buttons.includes(customId)) return;

    const embed = new EmbedBuilder()
      .setTitle("Ticket")
      .setDescription(
        `Hello ${member.user.username}, please describe your issue below.`
      )
      .setFooter({
        text: `Ticket ID: ${ticketId}`,
        iconURL: member.displayAvatarURL({ dynamic: true }),
      })
      .setColor("Random")
      .setTimestamp();

    const row = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("close")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⛔"),
      new ButtonBuilder()
        .setCustomId("lock")
        .setLabel("Lock Ticket")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🔐"),
      new ButtonBuilder()
        .setCustomId("unlock")
        .setLabel("Unlock Ticket")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🔓"),
      new ButtonBuilder()
        .setCustomId("claim")
        .setLabel("Claim")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🛄")
    );

    let everyoneRole = guild.roles.cache.find((r) => r.name === "@everyone");

    const ticketChannel = await guild.channels.create({
      name: `ticket-${ticketId}`,
      type: ChannelType.GuildText,
      parent: Static.ticketParent,
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [ViewChannel, SendMessages, ReadMessageHistory],
        },
        {
          id: member.id,
          allow: [ViewChannel, SendMessages, ReadMessageHistory],
        },
      ],
    });

    await ticketChannel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: `Your ticket has been created! ${ticketChannel}`,
      ephemeral: true,
    });

    await ticketSchema.create({
      GuildId: guild.id,
      MembersID: member.id,
      TicketID: ticketId,
      ChannelID: ticketChannel.id,
      Closed: false,
      Locked: false,
      Type: customId,
      Claimed: false,
    });
  }
);
