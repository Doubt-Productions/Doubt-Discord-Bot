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
    .setName("ban")
    .setDescription("Ban a user from the server!")
    .addUserOption((option) =>
      option
        .setName(`user`)
        .setDescription(`The user to ban!`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName(`reason`).setDescription(`The reason for the ban`)
    )
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */ run: async (client, interaction, args) => {
    const user = interaction.options.getUser(`user`);
    const member = interaction.options.getMember(`user`);
    const reason =
      interaction.options.getString(`reason`) || "No reason provided";

    if (member && !member.bannable) {
      return interaction.reply({
        content: `I cannot ban this user!`,
        ephemeral: true,
      });
    }

    await user
      .send({
        content: `You have been banned from ${interaction.guild.name} for ${reason}!`,
      })
      .catch((err) => {
        log(err, "err");
      });

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply({
        content: `Successfully banned ${user.tag} for ${reason}!`,
        ephemeral: true,
      });
    } catch (err) {
      log(err, "err");
      await interaction.reply({
        content: `An error occurred!`,
        ephemeral: true,
      });
    }
  },
};
