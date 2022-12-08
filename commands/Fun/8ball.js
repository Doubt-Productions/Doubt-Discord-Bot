const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Play a game of 8ball")
    .setDefaultMemberPermissions()
    .addStringOption((option) =>
      option
        .setName(`question`)
        .setDescription(`The question you want to ask the 8ball`)
        .setRequired(true)
    ),
  category: "General",
  run: async (client, interaction, config) => {
    const question = interaction.options.getString("question");
    const answers = [
      "It is certain.",
      "It is decidedly so.",
      "Without a doubt.",
      "Yes - definitely.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Very doubtful.",
    ];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    const embed = new EmbedBuilder()
      .setTitle("8ball")
      .setDescription(`**Question:** ${question}`)
      .addFields({ name: "Answer:", value: `${answer}` })
      .setColor("Random");

    interaction.reply({ embeds: [embed] });
  },
};
