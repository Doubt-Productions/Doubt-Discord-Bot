const {
  ButtonInteraction,
  EmbedBuilder,
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");
const ExtendedClient = require("../../class/ExtendedClient");
const ticketSchema = require("../../schemas/ticketSchema");
const { canCloseTicket } = require("../../utils/ticketAuth");

module.exports = {
  customId: "ticket-close",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const channel = interaction.channel;
    const ticketData = await ticketSchema.findFirst({
      where: { Guild: interaction.guild.id },
    });

    if (!canCloseTicket(interaction.member, channel, ticketData)) {
      return interaction.reply({
        content: "You do not have permission to close this ticket.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: "Closing this ticket in 10 seconds...",
      ephemeral: true,
    });

    const transcript = await discordTranscripts.createTranscript(channel, {
      poweredBy: false,
      saveImages: true,
    });

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 10000);

    const embed = new EmbedBuilder()
      .setColor(`Blurple`)
      .setTitle(`Your ticket has been closed`)
      .setDescription(
        `Your ticket has been closed. If you wish to open another ticket, please do so by navigating to the ticket category and clicking the button.`
      )
      .setTimestamp()
      .setFooter({
        text: `${interaction.guild.name} tickets`,
        iconURL: `${interaction.guild.iconURL({ dynamic: true })}`,
      });

    await interaction.member
      .send({ embeds: [embed], files: [transcript] })
      .catch(() => {});
  },
};
