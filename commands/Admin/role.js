const {
  EmbedBuilder,
  Client,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");
const Config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage the role system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Please select an option")
        .setRequired(true)
        .addChoices(
          { name: "Add", value: "add" },
          { name: "Remove", value: "remove" },
          { name: "Add All", value: "add-all" },
          { name: "Remove All", value: "remove-all" }
        )
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("Select the role").setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select the user")
        .setRequired(false)
    ),
  category: "Admin",
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {Config} config
   */
  run: async (client, interaction, config) => {
    const { options, guild, member } = interaction;

    const Options = options.getString("type");
    const Role = options.getRole("role");
    const Target = options.getMember("user") || member;

    if (guild.members.me.roles.highest.position <= Role.position) {
      return interaction.reply({
        content: "❌ | I can't manage this role",
        ephemeral: true,
      });
    }

    switch (Options) {
      case "give":
        {
          if (Target.roles.cache.find((r) => r.id === Role.id))
            return interaction.reply({
              ephemeral: true,
              content: `❌ | ${Target} already has this role`,
            });

          await Target.roles.add(Role);

          interaction.reply(`✅ | ${Target} has been given ${Role.name}`);
        }
        break;

      case "take":
        {
          if (!Target.roles.cache.find((r) => r.id === Role.id))
            return interaction.reply({
              ephemeral: true,
              content: `❌ | ${Target} doesn't have this role`,
            });

          await Target.roles.remove(Role);

          interaction.reply(`✅ | ${Role.name} has been taken from ${Target}`);
        }
        break;

      case "give-all":
        {
          const Members = guild.members.cache.filter((m) => !m.user.bot);

          Members.forEach((m) => m.roles.add(Role));

          await interaction.reply(`✅ | everyone has been given ${Role.name}`);
        }
        break;

      case "take-all":
        {
          const Members = guild.members.cache.filter((m) => !m.user.bot);

          Members.forEach((m) => m.roles.remove(Role));

          await interaction.reply(
            `✅ | ${Role.name} has been removed from everyone.`
          );
        }
        break;
    }
  },
};
