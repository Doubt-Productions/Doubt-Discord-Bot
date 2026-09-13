const {
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const ticketSchema = require("../../schemas/ticketSchema");

const TICKET_MODAL_PREFIX = "ticket-modal:";

module.exports = {
  customId: "ticket-modal",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    const reason = interaction.fields.getTextInputValue("reason");
    const subject = decodeTicketSubject(interaction.customId);

    const data = await ticketSchema.findFirst({
      where: { Guild: interaction.guild.id },
    });

    const posChannel = interaction.guild.channels.cache.find(
      (c) => c.name === `ticket-${interaction.user.displayName}`
    );
    if (posChannel) {
      return await interaction.reply({
        content: `You already have a ticket open!`,
        ephemeral: true,
      });
    }

    const category = data?.Category;
    if (!category) {
      return await interaction.reply({
        content: `Ticket system is not fully configured. Ask an admin to set a ticket category.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(`Blurple`)
      .setTitle(`${interaction.user.displayName}'s ticket`)
      .setDescription(
        `Welcome to your ticket! Please wait while the staff review your information`
      )
      .addFields({ name: `Subject`, value: `${subject}`, inline: true })
      .addFields({ name: `Reason`, value: `${reason}`, inline: true })
      .setFooter({
        text: `${interaction.guild.name} tickets`,
        iconURL: `${interaction.guild.iconURL({ dynamic: true })}`,
      });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket-close")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒")
    );

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.displayName}`,
      parent: category,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.guild.members.me.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        ...(data?.Role
          ? [
              {
                id: data.Role,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
            ]
          : []),
      ],
    });

    await channel.send({
      embeds: [embed],
      components: [button],
    });

    await interaction.reply({
      content: `Your ticket is now open in ${channel}`,
      ephemeral: true,
    });
  },
};

function decodeTicketSubject(customId) {
  if (!customId.startsWith(TICKET_MODAL_PREFIX)) {
    return "General";
  }

  const encoded = customId.slice(TICKET_MODAL_PREFIX.length);
  try {
    return decodeURIComponent(encoded) || "General";
  } catch {
    return "General";
  }
}
