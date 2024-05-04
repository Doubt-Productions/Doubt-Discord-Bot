const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ms = require("ms");
const { log } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server!")
    .addUserOption((option) =>
      option
        .setName(`user`)
        .setDescription(`The user to kick!`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName(`reason`).setDescription(`The reason for the kick`)
    )
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */ run: async (client, interaction, args) => {
    const member = interaction.options.getMember(`user`);
    const reason =
      interaction.options.getString(`reason`) || "No reason provided";

    if (!member.kickable) {
      return interaction.reply({
        content: `I cannot kick this user!`,
        ephemeral: true,
      });
    }

    member
      .send({
        content: `You have been kicked from ${interaction.guild.name} for ${reason}!`,
      })
      .catch((err) => {
        log(err, "err");
        interaction.reply({
          content: `An error occurred!`,
          ephemeral: true,
        });
      });
    await member
      .kick(reason)
      .then(() => {
        interaction.reply({
          content: `Successfully kicked ${member.user.tag} for ${reason}!`,
          ephemeral: true,
        });
      })
      .catch((err) => {
        log(err, "err");
        interaction.reply({
          content: `An error occurred!`,
          ephemeral: true,
        });
      });
  },
};
