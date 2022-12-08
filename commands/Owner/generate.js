const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ChatInputCommandInteraction,
} = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.json");
const moment = require("moment");
const voucher_codes = require("voucher-code-generator");
const schema = require("../../Systems/models/PremGen.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("generate")
    .setDescription("Generate a premium code")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("plan")
        .setDescription("Choose a plan to generate.")
        .setRequired(true)
        .addChoices(
          { name: "Daily", value: "daily" },
          { name: "Weekly", value: "weekly" },
          { name: "Monthly", value: "monthly" },
          { name: "Yearly", value: "yearly" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("How many codes do you want to generate?")
        .setRequired(false)
    ),
  category: "Owner",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   * @returns
   */
  run: async (client, interaction, config) => {
    if (!interaction.user.id === config.Users.ADMINS)
      return interaction.reply({
        content: "You are not allowed to use this command.",
        ephemeral: true,
      });
    // As defined in the Schema, leave codes as an empty array variable
    let codes = [];

    // Display available plans of the code
    const plan = interaction.options.getString("plan");

    // Calculate time for the code to expire.
    let time;
    if (plan === "daily") time = Date.now() + 86400000;
    if (plan === "weekly") time = Date.now() + 86400000 * 7;
    if (plan === "monthly") time = Date.now() + 86400000 * 30;
    if (plan === "yearly") time = Date.now() + 86400000 * 365;

    // If the input is for ex. 10, generate 10 Codes. Default => 1 Code / Command.
    let amount = interaction.options.getNumber("amount");
    if (!amount) amount = 1;

    for (var i = 0; i < amount; i++) {
      const codePremium = voucher_codes.generate({
        pattern: "####-####-####",
      });

      // Save the Code as a String ("ABCDEF ...") in the Database
      const code = codePremium.toString().toUpperCase();

      // Security check, check if the code exists in the database.
      const find = await schema.findOne({
        code: code,
      });

      // If it does not exist, create it in the database.
      if (!find) {
        schema.create({
          code: code,
          plan: plan,
          expiresAt: time,
        });

        // Push the new generated Code into the Queue
        codes.push(`${i + 1}- ${code}`);
      }
    }

    // Lastly, we want to send the new Code(s) into the Channel.
    interaction.reply({
      content: `\`\`\`Generated +${codes.length}\n\n--------\n${codes.join(
        "\n"
      )}\n--------\n\nType - ${plan}\nExpires - ${moment(time).format(
        "dddd, MMMM Do YYYY"
      )}\`\`\`\nTo redeem, use \`/redeem <code>\``,
      ephemeral: true,
    });
  },
};
