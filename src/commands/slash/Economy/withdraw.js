const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw money from your bank")
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money you want to withdraw")
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

    if (amount.toLowerCase === "all".toString()) {
      if (Data.Bank === 0)
        return await interaction.reply({
          content: `You don't have any money to withdraw!`,
          ephemeral: true,
        });

      Data.Wallet += Data.Bank;
      Data.Bank = 0;
      await Data.save();

      return await interaction.reply({
        content: `You withdrew all your money!`,
        ephemeral: true,
      });
    } else {
      const Converted = Number(amount);

      if (isNaN(Converted) === true)
        return await interaction.reply({
          content: `The amount can only be a number`,
          ephemeral: true,
        });

      if (Data.Bank < parseInt(Converted) || Converted === Infinity)
        return await interaction.reply({
          content: `You don't have that much money!`,
          ephemeral: true,
        });

      Data.Wallet += parseInt(Converted);
      Data.Bank -= parseInt(Converted);
      Data.Bank = Math.abs(Data.Bank);
      await Data.save();

      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`Withdrawal Success!`)
        .setDescription(`You withdrew $${Converted} from your bank!`);

      return await interaction.reply({ embeds: [embed] });
    }
  },
};
