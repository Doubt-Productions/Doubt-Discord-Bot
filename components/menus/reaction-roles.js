const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: {
    name: "reaction-roles",
  },
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} client
   */
  async execute(interaction, client) {
    for (let i = 0; i < values.length; i++) {
      const roleId = values[i];

      const role = guild.roles.cache.get(roleId);
      const hasRole = member.roles.cache.has(role);

      switch (hasRole) {
        case true:
          member.roles.remove(role);
          break;
        case false:
          member.roles.add(role);
          break;
      }
    }

    interaction.reply({ content: "Roles updated", ephemeral: true });
  },
};
