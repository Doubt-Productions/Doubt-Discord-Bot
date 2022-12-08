const {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages you want to clear.")
        .setRequired(true)
    ),
  category: "Moderation",
  run: async (client, interaction, config, db) => {
    const { options, channel } = interaction;
    const amount = options.getInteger("amount");

    if (amount > 100) {
      return interaction.reply({
        content: "You can only delete up to 100 messages at a time.",
        ephemeral: true,
      });
    }

    await channel.bulkDelete(amount);

    const embed = new EmbedBuilder()
      .setTitle("Success!")
      .setDescription(`Deleted ${amount} messages.`)
      .setColor("00FF00");

    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });
    setTimeout(() => {
      message.delete();
    }, 5000);
  },
};
