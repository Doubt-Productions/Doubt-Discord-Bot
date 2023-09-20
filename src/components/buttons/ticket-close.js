const {
  ButtonInteraction,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  customId: "ticket-close",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    const channel = interaction.channel;

    const transcript = await discordTranscripts.createTranscript(channel, {
      poweredBy: false,
      saveImages: true,
    });

    setTimeout(async () => {
      interaction.channel.delete();
    }, 10000);

    const embed = new EmbedBuilder()
      .setColor(`Blurple`)
      .setTitle(`Your ticket has been closed`)
      .setDescription(
        `Your ticket has been closed. If you wish to open another ticket, Please do so by navigating to the ticket category and clicking the button.`
      )
      .setTimestamp()
      .setFooter({
        text: `${interaction.guild.name} tickets`,
        iconURL: `${interaction.guild.iconURL({ dynamic: true })}`,
      });

    await interaction.member
      .send({ embeds: [embed], files: [transcript] })
      .catch(() => {
        return;
      });
  },
};
