const {
  MessageContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const translate = require("@iamtraction/google-translate");

module.exports = {
  structure: new ContextMenuCommandBuilder()
    .setName("Translate Message")
    .setType(3),
  /**
   * @param {ExtendedClient} client
   * @param {MessageContextMenuCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const message = interaction.targetMessage;

    if (!message) {
      return;
    }

    const translatedMessage = await translate(message.content, { to: "en" });

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({
        name: message.author.displayName,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("🔍 Translation Successful!")
      .addFields({ name: "Original Message", value: `${message.content}` })
      .addFields({ name: "Translated Message", value: `${translatedMessage.text}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
