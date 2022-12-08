const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  SelectMenuBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const rrSchema = require("../../Systems/models/ReactionRoles");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Send the panel for the reaction roles")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { options, guildId, guild, channel } = interaction;

    try {
      const data = await rrSchema.findOne({ GuildID: guildId });

      if (!data.roles.length > 0) {
        return interaction.reply({
          content: "There are no roles to select",
          ephemeral: true,
        });
      }

      const panelEmbed = new EmbedBuilder()
        .setTitle("Reaction Roles")
        .setDescription("Select a role from the dropdown menu to get the role")
        .setColor("Blurple");

      const options = data.roles.map((x) => {
        const role = guild.roles.cache.get(x.roleId);

        return {
          label: role.name,
          value: role.id,
          description: x.roleDescription,
          emoji: x.roleEmoji || undefined,
        };
      });

      const menuComponents = [
        new ActionRowBuilder().addComponents(
          new SelectMenuBuilder()
            .setCustomId("reaction-roles")
            .setMaxValues(options.length)
            .addOptions(options)
        ),
      ];

      channel.send({ embeds: [panelEmbed], components: [menuComponents] });

      return interaction.reply({
        content: "Reaction roles panel sent",
        ephemeral: true,
      });
    } catch (e) {
      console.log(e);
    }
  },
};
