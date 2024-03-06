const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money to your bank")
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money you want to deposit")
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { user, guild, options } = interaction;

    const amount = options.getString("amount");
    let Data = await ecoSchema.findOne({ User: user.id, Guild: guild.id });
    if (amount.startsWith("-"))
      return await interaction.reply({
        content: "You can't withdraw negative money!",
        ephemeral: true,
      });

    if (!Data)
      return await interaction.reply({
        content: `You don't have an account!`,
        ephemeral: true,
      });

    if (amount.toLowerCase === "all") {
      if (Data.Wallet === 0)
        return await interaction.reply({
          content: `You don't have any money to deposit!`,
          ephemeral: true,
        });

      Data.Bank += Data.Wallet;
      Data.Wallet = 0;
      await Data.save();

      return await interaction.reply({
        content: `You deposited all your money!`,
        ephemeral: true,
      });
    } else {
      const Converted = Number(amount);

      if (isNaN(Converted) === true)
        return await interaction.reply({
          content: `The amount can only be a number or \`all\`!`,
          ephemeral: true,
        });

      if (Data.Wallet < parseInt(Converted) || Converted === Infinity)
        return await interaction.reply({
          content: `You don't have that much money!`,
          ephemeral: true,
        });

      Data.Bank += parseInt(Converted);
      Data.Wallet -= parseInt(Converted);
      Data.Wallet = Math.abs(Data.Wallet);
      await Data.save();

      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`Deposit Success!`)
        .setDescription(`You deposited $${Converted} into your bank!`);

      return await interaction.reply({ embeds: [embed] });
    }
  },
};
