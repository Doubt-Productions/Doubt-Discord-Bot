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
    const guilds = client.guilds.cache.map((guild) => {
      return {
        name: guild.name,
        id: guild.id,
        memberCount: guild.memberCount,
        owner: guild.ownerId,
      };
    });

    const guildsArray = [];
    for (let i = 0; i < guilds.length; i += 10) {
      const current = guilds.slice(i, i + 10);
      guildsArray.push(current);
    }

    const pages = guildsArray.map((guilds, index) => {
      const description = guilds
        .map(
          (guild) =>
            `**${guild.name}**\nID: ${guild.id}\nMember Count: ${guild.memberCount}\nOwner: <@${guild.owner}>`
        )
        .join("\n\n");

      return new EmbedBuilder()
        .setTitle(`Guilds List - Page ${index + 1}/${guildsArray.length}`)
        .setDescription(description)
        .setColor("Green");
    });

    await buttonPagination(interaction, pages, 30000);
  },
};
