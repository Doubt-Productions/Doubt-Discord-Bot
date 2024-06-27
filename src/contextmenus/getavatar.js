const {
  UserContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../class/ExtendedClient");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("getavatar").setType(2),
  /**
   * @param {ExtendedClient} client
   * @param {UserContextMenuCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${user.displayName}'s avatar`)
          .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
          .setColor("Blurple"),
      ],
    });
  },
};
