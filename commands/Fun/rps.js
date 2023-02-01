const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("play a game of rock paper scissors")
    .setDefaultMemberPermissions()
    .addStringOption((option) =>
      option
        .setName(`choice`)
        .setDescription(`The choice you want to make`)
        .setRequired(true)
        .addChoices(
          { name: "Rock", value: "Rock" },
          { name: "Paper", value: "Paper" },
          { name: "Scissors", value: "Scissors" }
        )
    ),
  category: "Fun",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const choice = interaction.options.getString("choice");
    const choices = ["Rock", "Paper", "Scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    const embed = new EmbedBuilder();

    if (choice === botChoice) {
      embed
        .setTitle("Rock Paper Scissors")
        .setDescription(
          `**Your choice:** ${choice}\n**Bot choice:** ${botChoice}`
        )
        .addFields({ name: "Result:", value: `It's a tie!` })
        .setColor("Yellow");
    } else if (
      (choice === "Rock" && botChoice === "Scissors") ||
      (choice === "Paper" && botChoice === "Rock") ||
      (choice === "Scissors" && botChoice === "Paper")
    ) {
      embed
        .setTitle("Rock Paper Scissors")
        .setDescription(
          `**Your choice:** ${choice}\n**Bot choice:** ${botChoice}`
        )
        .addFields({ name: "Result:", value: `You win!` })
        .setColor("Green");
    } else {
      embed
        .setTitle("Rock Paper Scissors")
        .setDescription(
          `**Your choice:** ${choice}\n**Bot choice:** ${botChoice}`
        )
        .addFields({ name: "Result:", value: `You lose!` })
        .setColor("Red");
    }

    interaction.reply({ embeds: [embed] });
  },
};
