const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { safeEval } = require("../../../utils/safeEval");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Execute some codes.")
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("The code to be executed.")
        .setRequired(true)
    ),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    await interaction.deferReply();
    const toCode = interaction.options.getString("code");

    let executedEvalValue;
    try {
      executedEvalValue = await safeEval(toCode, { client, interaction });
    } catch (error) {
      await interaction.editReply({
        content: `Eval failed: ${error.message}`,
      });
      return;
    }

    const output =
      executedEvalValue === undefined
        ? "undefined"
        : typeof executedEvalValue === "string"
          ? executedEvalValue
          : JSON.stringify(executedEvalValue, null, 2);

    const embed = new EmbedBuilder()
      .setTitle("Code executed")
      .setDescription(`The return output was:\n\`\`\`\n${output.slice(0, 3500)}\n\`\`\``);

    await interaction.editReply({ embeds: [embed] });
  },
};
