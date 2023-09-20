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

module.exports = {
  customId: "ticket-modal",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    const reason = interaction.fields.getTextInputValue("reason");

    const data = await ticketSchema.findOne({ Guild: interaction.guild.id });

    const posChannel = await interaction.guild.channels.cache.find(
      (c) => c.name === `ticket-${interaction.user.displayName}`
    );
    if (posChannel)
      return await interaction.reply({
        content: `You already have a ticket open!`,
        ephemeral: true,
      });

    const category = data.Channel;

    const embed = new EmbedBuilder()
      .setColor(`Blurple`)
      .setTitle(`${interaction.user.displayName}'s ticket`)
      .setDescription(
        `Welcome to your ticket! Please wait while the staff review your information`
      )
      .addFields({ name: `Subject`, value: `${data.Ticket}`, inline: true })
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

    let channel = await interaction.guild.channels.create({
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
        {
          id: data.Role,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        }
      ],
    });

    let msg = await channel.send({
      embeds: [embed],
      components: [button],
    });

    await interaction.reply({
      content: `Your ticket is now open in ${channel}`,
      ephemeral: true,
    });
  },
};
