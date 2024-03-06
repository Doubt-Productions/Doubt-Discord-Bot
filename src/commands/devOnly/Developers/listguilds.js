const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { buttonPagination } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listguilds")
    .setDescription("List all guilds!"),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const guildArray = [];

    const guilds = client.guilds.cache;
    const guildChunks = guilds.reduce(
      (acc, guild) => {
        const chunk = acc[acc.length - 1];
        if (chunk.length < 10) {
          chunk.push(guild);
        } else {
          acc.push([guild]);
        }
        return acc;
      },
      [[]]
    );

    const page = interaction.options.getInteger("page") || 1;
    const guildChunk = guildChunks[page - 1];

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Guild List")
      .setDescription(`Page ${page}/${guildChunks.length}`);

    guildChunk.forEach((guild) => {
      embed.addFields({ name: `${guild.name}`, value: `ID: ${guild.id}` });
    });

    if (guildChunks.length > 1) {
      guildArray.push(embed);
    }

    if (guildArray.length > 1) {
      await buttonPagination(interaction, guildArray);
    }

    interaction.reply({ embeds: [embed] });
  },
};
