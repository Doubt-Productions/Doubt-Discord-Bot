const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("beg")
    .setDescription("Beg for money"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { user, guild } = interaction;

    let Data = await ecoSchema.findOne({ User: user.id, Guild: guild.id });

    let negative = Math.round(Math.random() * -300 - 10);
    let positive = Math.round(Math.random() * 300 + 10);

    const posN = [negative, positive];

    const amount = Math.round(Math.random() * posN.length);
    const value = posN[amount];

    if (!value)
      return await interaction.reply({
        content: `No money for you!`,
        ephemeral: true,
      });

    if (Data) {
      Data.Wallet += value;
      await Data.save();
    }

    if (value > 0) {
      const positiveChoices = [
        "The gods gave you",
        "You found",
        "You begged and got",
        "Vapor is super nice and gave you",
        "You won the lottery and got",
      ];

      const posName = Math.round(Math.random() * positiveChoices.length);

      const embed1 = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("Beg command")
        .addFields({
          name: "Beg result",
          value: `${positiveChoices[[posName]]} $${value}`,
        });

      await interaction.reply({ embeds: [embed1] });
    } else {
      const negativeChoices = [
        "The gods reconsidered their decision and took away",
        "You lost",
        "You begged and someone stole",
        "Vapor is super nice and took",
        "You lost the lottery and lost",
        "You got robbed and lost",
        "You got scammed and lost",
        "You got mugged and lost",
      ];

      const negName = Math.round(Math.random() * negativeChoices.length - 1);

      const stringV = `${value}`;

      const nonSymbol = await stringV.slice(1);

      const embed2 = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("Beg command")
        .addFields({
          name: "Beg result",
          value: `${negativeChoices[[negName]]} $${nonSymbol}`,
        });

      await interaction.reply({ embeds: [embed2] });
    }
  },
};
