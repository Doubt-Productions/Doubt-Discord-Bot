const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const rrSchema = require("../../Systems/models/ReactionRoles");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Remove a role from the reaction roles system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
      option.setName("role").setDescription("The role to add").setRequired(true)
    ),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { options, guildId, member } = interaction;

    const role = options.getRole("role");

    try {
      const data = await rrSchema.findOne({ GuildID: guildId });
      if (!data) {
        return interaction.reply({
          content: "This server doens't have any data",
          ephemeral: true,
        });
      }

      const roles = data.roles;
      const findRole = roles.find((r) => r.roleId === role.id);

      if (!findRole) {
        return interaction.reply({
          content: "That role does not exist",
          ephemeral: true,
        });
      }

      const filteredRoles = roles.filter((r) => r.roleId !== role.id);
      data.roles = filteredRoles;

      await data.save();

      return interaction.reply(`Removed role ${role.name}`);
    } catch (e) {
      console.log(e);
    }
  },
};
