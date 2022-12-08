const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const warningSchema = require("../../Systems/models/Warnings");
const client = require("../../index");
const config = require("../../config/config.json");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Manage warnings for a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a warning to a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to warn.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("The reason for the warning.")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("evidence")
            .setDescription("Evidence for the warning.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a warning from a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to remove a warning from.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The warning you want to remove.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("check")
        .setDescription("List all warnings for a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to check.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Clear all warnings for a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to clear.")
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  category: "Moderation",
  run: async (client, interaction, config) => {
    const { options, guildId, user, member } = interaction;

    const sub = options.getSubcommand(["add", "check", "remove", "clear"]);
    const target = options.getUser("user");
    const reason = options.getString("reason") || "No reason provided.";
    const evidence = options.getString("evidence") || "No evidence provided";
    const warnId = options.getInteger("id") - 1;
    const warnDate = new Date(
      interaction.createdTimestamp
    ).toLocaleDateString();

    const userTag = `${target.username}#${target.discriminator}`;

    const embed = new EmbedBuilder();

    switch (sub) {
      case "add":
        warningSchema.findOne(
          { GuildID: guildId, UserId: target.id, UserTag: userTag },
          async (err, data) => {
            if (err) throw err;

            if (!data) {
              data = new warningSchema({
                GuildID: guildId,
                UserId: target.id,
                UserTag: userTag,
                Content: [
                  {
                    ExecutorId: user.id,
                    ExecutorTag: user.tag,
                    Reason: reason,
                    Evidence: evidence,
                    Date: warnDate,
                  },
                ],
              });
            } else {
              const warnContent = {
                ExecutorId: user.id,
                ExecutorTag: user.tag,
                Reason: reason,
                Evidence: evidence,
                Date: warnDate,
              };
              data.Content.push(warnContent);
            }
            data.save();
          }
        );

        embed
          .setColor("Green")
          .setDescription(
            `
        Warning added: ${userTag} | ||${target.id}||
        **Reason**: ${reason}
        **Evidence**: ${evidence}    
        `
          )
          .setFooter({
            text: member.user.tag,
            iconURL: member.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        interaction.reply({ embeds: [embed] });
        break;
      case "check":
        warningSchema.findOne(
          { GuildID: guildId, UserId: target.id, UserTag: userTag },
          (err, data) => {
            if (err) throw err;
            if (data) {
              embed
                .setColor("Green")
                .setDescription(
                  `${data.Content.map(
                    (w, i) =>
                      `**ID**: ${i + 1}
                **Executor**: ${w.ExecutorTag} | ||${w.ExecutorId}||
                **Reason**: ${w.Reason}
                **Evidence**: ${w.Evidence}
                **Date**: ${w.Date}\n\n
                      `
                  ).join(" ")}`
                )
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

              interaction.reply({ embeds: [embed] });
            } else {
              embed
                .setColor("Red")
                .setDescription(
                  `${userTag} | ||${target.id}|| has no warnings.`
                )
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

              interaction.reply({ embeds: [embed] });
            }
          }
        );
        break;
      case "remove":
        warningSchema.findOne(
          { GuildID: guildId, UserId: target.id, UserTag: userTag },
          (err, data) => {
            if (err) throw err;
            if (data) {
              data.Content.splice(warnId, 1);
              data.save();

              embed
                .setColor("Green")
                .setDescription(
                  `${userTag}'s warning id: ${warnId + 1} has been removed.`
                )
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.user.avatarURL({ dynamic: true }),
                })
                .setTimestamp();
              interaction.reply({ embeds: [embed] });
            } else {
              embed
                .setColor("Red")
                .setDescription(
                  `${userTag} | ||${target.id}|| has no warnings.`
                )
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

              interaction.reply({ embeds: [embed] });
            }
          }
        );
        break;
      case "clear":
        warningSchema.findOne(
          { GuildID: guildId, UserId: target.id, UserTag: userTag },
          async (err, data) => {
            if (err) throw err;
            if (data) {
              await warningSchema.findOneAndDelete({
                GuildID: guildId,
                UserId: target.id,
                UserTag: userTag,
              });

              embed
                .setColor("Green")
                .setDescription(
                  `${userTag}'s warnings were cleared. | ||${target.id}||`
                )
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();
              interaction.reply({ embeds: [embed] });
            } else {
              embed
                .setColor("Red")
                .setDescription(
                  `${userTag} | ||${target.id}|| has no warnings.`
                )
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

              interaction.reply({ embeds: [embed] });
            }
          }
        );
        break;
    }
  },
};
