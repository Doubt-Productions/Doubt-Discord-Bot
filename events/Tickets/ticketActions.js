const {
  ButtonInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const TicketSetup = require("../../Systems/models/TicketSetup");
const { createTranscript } = require("discord-html-transcripts");
const ticketSchema = require("../../Systems/models/tickets");
const client = require("../../index");

module.exports = {
  name: "ticketActions",
};

client.on(
  "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async (interaction) => {
    const { guild, member, customId, channel } = interaction;
    const { ManageChannels, SendMessages } = PermissionFlagsBits;

    if (!interaction.isButton()) return;

    if (!["close", "lock", "unlock", "claim"].includes(customId)) return;

    const docs = TicketSetup.findOne({ GuildID: guild.id });

    if (!docs) return;

    if (!guild.members.me.permissions.has((r) => r.id === docs.Handlers.id))
      return interaction.reply({
        content: "I do not have permission to manage channels",
        ephemeral: true,
      });

    if (!channel.permissionsFor(member).has(SendMessages))
      return interaction.reply({
        content: "You do not have permission to use this button",
        ephemeral: true,
      });

    const embed = new EmbedBuilder().setColor("Aqua");

    ticketSchema.findOne({ ChannelID: channel.id }, async (err, data) => {
      if (err) throw err;
      if (!data) return;

      const fetchedMember = guild.members.cache.get(data.MembersID);

      switch (customId) {
        case "close":
          if (data.closed == true)
            return interaction.reply({
              content:
                "This ticket has already been closed and will be deleted in a few seconds",
              ephemeral: true,
            });

          const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: "attachment",
            filename: `${member.user.username}-ticket${data.Type}-${data.TicketID}.html`,
            saveImages: true,
            poweredBy: false,
          });

          await ticketSchema.updateOne(
            { ChannelID: channel.id },
            { closed: true }
          );

          const transcriptEmbed = new EmbedBuilder()
            .setTitle(
              `Transcript Type: ${data.Type} | Ticket ID: ${data.TicketID}`
            )
            .setFooter({
              text: member.user.tag,
              iconURL: member.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          const transcriptProcess = new EmbedBuilder()
            .setTitle(`Saving transcript...`)
            .setDescription(
              `Ticket will be closed in 10 seconds, enable dm's for the ticket transcript.`
            )
            .setColor("Red")
            .setTimestamp();

          const res = await guild.channels.cache.get(Static.transcripts).send({
            embeds: [transcriptEmbed],
            files: [transcript],
          });

          channel.send({ embeds: [transcriptProcess] });

          setTimeout(function () {
            member
              .send({
                embeds: [
                  transcriptEmbed.setDescription(
                    `[Click Here](${res.url}) to view the transcript.`
                  ),
                ],
              })
              .catch(() =>
                channel.send(
                  "Couldn't send transcript in DMs, please enable them."
                )
              );
            channel.delete();
          }, 10000);

          break;

        case "lock":
          if (!member.permissions.has(ManageChannels))
            return interaction.reply(
              `You do not have permission to use this button.`
            );
          if (data.locked == true)
            return interaction.reply({
              content: "This ticket has already been locked.",
              ephemeral: true,
            });
          await ticketSchema.updateOne(
            { ChannelID: channel.id },
            { locked: true }
          );
          embed.setDescription("Ticket was locked successfully. 🔒");

          data.MembersID.forEach((m) => {
            channel.permissionOverwrites.edit(fetchedMember, {
              SendMessages: false,
            });
          });

          return interaction.reply({ embeds: [embed] });

        case "unlock":
          if (!member.permissions.has(ManageChannels))
            return interaction.reply(
              `You do not have permission to use this button.`
            );
          if (data.locked == false)
            return interaction.reply({
              content: "This ticket is not locked.",
              ephemeral: true,
            });
          await ticketSchema.updateOne(
            { ChannelID: channel.id },
            { locked: false }
          );
          embed.setDescription("Ticket was unlocked successfully. 🔓");

          data.MembersID.forEach((m) => {
            channel.permissionOverwrites.edit(fetchedMember, {
              SendMessages: false,
            });
          });

          return interaction.reply({ embeds: [embed] });

        case "claim":
          if (!member.permissions.has(ManageChannels))
            return interaction.reply({
              content: `You do not have permission to use this button.`,
              ephemeral: true,
            });

          if (data.Claimed === true)
            return interaction.reply({
              content: "This ticket has already been claimed.",
              ephemeral: true,
            });

          await ticketSchema.updateOne({ ChannelID: channel.id }, { Claimed: true, ClaimedBy: member.id });

          embed.setDescription(`Ticket was claimed by ${member}.`);

          interaction.reply({ embeds: [embed]})
      }
    });
  }
);
