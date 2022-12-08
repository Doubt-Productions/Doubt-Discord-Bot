const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slash-clear")
    .setDescription("Cleaer Slash Commands")
    .setDefaultMemberPermissions(0),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    const token = config.Client.TOKEN;
    const clientId = config.Client.ID;
    const guildId = config.Handlers.GUILD_ID;

    const rest = new REST({ version: "10" }).setToken(token);
    rest.get(Routes.applicationCommands(clientId)).then(async (data) => {
      const promises = [];
      for (const command of data) {
        const deleteUrl = `${Routes.applicationCommands(clientId)}/${
          command.id
        }`;
        promises.push(rest.delete(deleteUrl));
      }
      await interaction.reply("Slash Commands Cleared");
      return Promise.all(promises);
    });
  },
};
