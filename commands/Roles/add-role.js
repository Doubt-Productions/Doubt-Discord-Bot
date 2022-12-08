const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const rrSchema = require("../../Systems/models/ReactionRoles");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Add a role to the reaction roles system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
      option.setName("role").setDescription("The role to add").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of the role")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("The emoji to react with")
        .setRequired(false)
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
    const description = options.getString("description");
    const emoji = options.getString("emoji");

    try {
      if (role.position >= member.roles.highest.position) {
        return interaction.reply({
          content: "I don't have permissions for that role!",
          ephemeral: true,
        });
      }

      const newRole = {
        roleId: role.id,
        roleDescription: description || "No description provided",
        roleEmoji: emoji || "",
      };

      const data = await rrSchema.findOne({ GuildID: guildId });
      console.log(data);
      if (data) {
        let roleData = data.roles.find((x) => x.roleId === role.id);

        if (roleData) {
          roleData = newRoleData;
        } else {
          data.roles = [...data.roles, newRole];
        }
      } else {
        await rrSchema.create({
          GuildID: guildId,
          roles: newRole,
        });
      }

      return interaction.reply({
        content: `Added ${role.name} to the reaction roles!`,
        ephermeal: true,
      });
    } catch (e) {
      console.log(e);
    }
  },
};
