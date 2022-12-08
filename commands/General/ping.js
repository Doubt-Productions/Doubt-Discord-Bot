const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong!")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  category: "General",
  /**
   * 
   * @param {*} client 
   * @param {ChatInputCommandInteraction} interaction 
   * @param {*} config 
   */
  run: async (client, interaction, config) => {
    const embed = new EmbedBuilder()
      .setTitle("Pong!")
      .setDescription(`Websocket ping is ${client.ws.ping}ms.`)
      .setColor("Random");
  },
};
