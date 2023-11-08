const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("accept")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Accept a user into the staff team!")
    .addStringOption((option) =>
      option
        .setName(`user`)
        .setDescription(`The user you want to accept!`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName(`role`)
        .setDescription(`The role you want to give to the user!`)
        .addChoices({ name: `Trial Staff`, value: `trialstaff` })
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.reply({
      content: `This command is currently under development!`,
    });
  },
};
