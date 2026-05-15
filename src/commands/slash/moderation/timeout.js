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
    )
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const target = interaction.options.getMember("user");
    const duration = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") || "No reason provided.";

    const msDuration = ms(duration);
    if (!msDuration || msDuration < 5000 || msDuration > 2419200000) {
      return await interaction.reply({
        content: "Please provide a valid duration between 5 seconds and 28 days.",
        ephemeral: true,
      });
    }

    if (!target) {
      return await interaction.reply({
        content: "The specified user is not in this server.",
        ephemeral: true,
      });
    }

    if (!target.moderatable) {
      return await interaction.reply({
        content: "I cannot timeout this user. They may have higher permissions than me.",
        ephemeral: true,
      });
    }

    await target.timeout(msDuration, reason);

    const embed = new EmbedBuilder()
      .setTitle("User Timed Out")
      .setDescription(`${target} has been timed out for ${duration}.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Orange")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
