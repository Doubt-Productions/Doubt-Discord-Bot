const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ms = require("ms");
const { log } = require("../../../functions");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Time a user out!")
    .addUserOption((option) =>
      option
        .setName(`user`)
        .setDescription(`The user to time out!`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName(`duration`)
        .setDescription(`The duration of the time out`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName(`reason`).setDescription(`The reason for the time out`)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */ run: async (client, interaction, args) => {},
};
