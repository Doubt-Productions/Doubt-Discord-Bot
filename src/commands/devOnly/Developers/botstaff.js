const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const botStaffModel = require("../../../schemas/botStaff");
const {
  addBotStaff,
  removeBotStaff,
  migrateLegacyStaffRoles,
  BOT_STAFF_BADGE_EMOJI,
} = require("../../../utils/botStaff");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botstaff")
    .setDescription("Manage global bot staff (cross-guild)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a user as global bot staff")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to add as bot staff")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a user from global bot staff")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to remove from bot staff")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all global bot staff")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("migrate")
        .setDescription(
          "One-time cutover: import legacy moderation.staffRoles members into BotStaff"
        )
    ),

  options: {
    developers: true,
  },

  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const user = interaction.options.getUser("user", true);
      const record = await addBotStaff(user.id, interaction.user.id);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${BOT_STAFF_BADGE_EMOJI} Bot staff added`)
            .setDescription(
              `**${user.tag}** (\`${user.id}\`) is now global bot staff.\n` +
                `Added by **${interaction.user.tag}** at <t:${Math.floor(
                  record.addedAt.getTime() / 1000
                )}:F>.`
            )
            .setColor("Green"),
        ],
      });
      return;
    }

    if (subcommand === "migrate") {
      const result = await migrateLegacyStaffRoles(
        client,
        interaction.user.id
      );

      const fields = [
        {
          name: "Result",
          value: result.message,
        },
      ];

      if (result.guildId) {
        fields.push({
          name: "Guild",
          value: `\`${result.guildId}\``,
          inline: true,
        });
      }

      if (result.roleIds?.length) {
        fields.push({
          name: "Legacy role IDs",
          value: result.roleIds.map((id) => `\`${id}\``).join(", "),
          inline: false,
        });
      }

      if (result.migrated?.length) {
        fields.push({
          name: "Migrated users",
          value: result.migrated.map((id) => `<@${id}> (\`${id}\`)`).join("\n"),
        });
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${BOT_STAFF_BADGE_EMOJI} Bot staff migration`)
            .addFields(fields)
            .setColor(result.migrated?.length ? "Green" : "Orange"),
        ],
      });
      return;
    }

    if (subcommand === "remove") {
      const user = interaction.options.getUser("user", true);
      const record = await removeBotStaff(user.id);

      if (!record) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Not bot staff")
              .setDescription(`**${user.tag}** is not in the bot staff list.`)
              .setColor("Red"),
          ],
        });
        return;
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${BOT_STAFF_BADGE_EMOJI} Bot staff removed`)
            .setDescription(
              `**${user.tag}** (\`${user.id}\`) is no longer global bot staff.`
            )
            .setColor("Orange"),
        ],
      });
      return;
    }

    const staff = await botStaffModel.findMany({ orderBy: { addedAt: "desc" } });

    if (staff.length === 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${BOT_STAFF_BADGE_EMOJI} Bot staff`)
            .setDescription("No global bot staff members yet.")
            .setColor("Blurple"),
        ],
      });
      return;
    }

    const lines = staff.map((entry) => {
      const addedAt = Math.floor(entry.addedAt.getTime() / 1000);
      return `• <@${entry.userId}> (\`${entry.userId}\`) — added by <@${entry.addedBy}> at <t:${addedAt}:R>`;
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${BOT_STAFF_BADGE_EMOJI} Bot staff (${staff.length})`)
          .setDescription(lines.join("\n"))
          .setColor("Blurple"),
      ],
    });
  },
};
