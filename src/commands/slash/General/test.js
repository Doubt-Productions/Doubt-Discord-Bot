
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  structure: new SlashCommandBuilder()
    .setName('test')
    .setDescription('A test command.'),
  run: async (interaction) => {
    await interaction.reply('This is a test command!');
  },
};
