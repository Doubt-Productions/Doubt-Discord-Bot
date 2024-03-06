const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    const days = Math.floor(client.uptime / 86400000);
    const hours = Math.floor(client.uptime / 3600000) % 24;
    const minutes = Math.floor(client.uptime / 60000) % 60;
    const seconds = Math.floor(client.uptime / 1000) % 60;

    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setTitle(`🏓 Pong! | ${client.user.username}'s Ping`)
      .setDescription(
        `In this embed you can find the client ping, websocket ping and the uptime of the bot.`
      )
      .addFields(
        {
          name: "Client Ping",
          value: `${ping}ms`,
          inline: true,
        },
        {
          name: "Websocket Ping",
          value: `${client.ws.ping}ms`,
          inline: true,
        },
        {
          name: "Uptime",
          inline: true,
          value: `${uptime}`,
        }
      );

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
