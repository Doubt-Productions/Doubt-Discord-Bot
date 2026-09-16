const { ModalSubmitInteraction, EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const welcomeSchema = require("../../schemas/welcomeSchema");
const { denyUnlessManageGuild } = require("../../utils/setupGuard");

module.exports = {
  customId: "welcome-message-modal",
  /**
   * @param {ExtendedClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!(await denyUnlessManageGuild(interaction))) return;

    const content = interaction.fields.getTextInputValue("welcomeMessage");
    const data = await welcomeSchema.findFirst({
      where: { Guild: interaction.guildId },
    });

    if (!data) {
      await welcomeSchema.create({
        data: {
          Guild: interaction.guildId,
          Message: content,
        },
      });
    } else {
      await welcomeSchema.update({
        where: { id: data.id },
        data: { Message: content },
      });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Welcome message saved")
          .setDescription(
            `Your welcome message has been saved.\n\n\`\`\`${content}\`\`\`\n\nUse \`/setup\` and **Go back** to configure other welcome options.`
          )
          .setColor("Blurple"),
      ],
      ephemeral: true,
    });
  },
};
