
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('A test command.')
    .toJSON(),
  run: async (interaction) => {
    await interaction.reply('This is a test command!');
  },
};
