const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bal")
    .setDescription("Check your balance"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { user, guild } = interaction;

    let Data = await ecoSchema.findOne({ User: user.id, Guild: guild.id });

    if (!Data)
      return await interaction.reply({
        content: `You don't have an account!`,
        ephemeral: true,
      });

    const wallet = Math.round(Data.Wallet);
    const bank = Math.round(Data.Bank);
    const total = Math.round(wallet + bank);

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`${user.displayName}'s balance`)
      .addFields(
        { name: "Wallet", value: `$${wallet}` },
        { name: "Bank", value: `$${bank}` },
        { name: "Total", value: `$${total}` }
      );
    await interaction.reply({ embeds: [embed] });
  },
};
