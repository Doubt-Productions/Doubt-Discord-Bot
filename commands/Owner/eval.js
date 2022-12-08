const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const Config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Eval Command for owners use only")
    .setDefaultMemberPermissions(0)
    .addStringOption((option) =>
      option.setName("code").setDescription("Code to eval").setRequired(true)
    ),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {Config} config
   */
  run: async (client, interaction, config) => {
    const { options, user } = interaction;
    if (!config.Users.ADMINS.includes(user.id)) return;

    try {
      const code = options.getString("code");

      if (code.includes("token"))
        return interaction.reply({
          ephermeal: true,
          content: "No token for you!",
        });
      if (code.includes("config"))
        return interaction.reply({
          ephemeral: true.valueOf,
          content: "No config for you!",
        });
      if (code.includes("MONGO"))
        return interaction.reply({
          content: "No database for you!",
          ephemeral: true,
        });
      if (code.includes("SECRET"))
        return interaction.reply({
          content: "No secret for you!",
          ephemeral: true,
        });

      const output = eval(code);

      return interaction.reply({
        ephemeral: true,
        content: `\`\`\`js\n${output}\`\`\``,
      });
    } catch (error) {
      interaction.reply({
        content: `\`\`\`js\n${error.stack}\`\`\``,
        ephemeral: true,
      });
    }
  },
};
