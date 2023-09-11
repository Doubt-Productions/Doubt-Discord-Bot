const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { Rank } = require("canvacord");

const xp = require("../../../schemas/XpSchema");
const { log } = require("../../../functions");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("View your or another users rank")
    .addSubcommand((sub) =>
      sub
        .setName("info")
        .setDescription("View your or another users rank")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user to view")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription("Reset your or another users rank")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user to reset")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set your or another users rank")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user to set")
            .setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("level")
            .setDescription("The level to set")
            .setRequired(true)
        )
    ),

  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "info":
        const member =
          interaction.options.getMember("user") || interaction.member;
        let user;

        const guildId = member.guild.id;
        const userId = member.user.id;

        user = await xp.findOne({ guildId, userId });

        if (!user) {
          user = {
            level: 1,
            xp: 0,
          };
        }

        const rank = new Rank()
          .setAvatar(member.user.displayAvatarURL({ format: "png" }))
          .setCurrentXP(user.xp)
          .setLevel(user.level)
          .setRank(0, 0, false)
          .setStatus(member.presence.status)
          .setProgressBar("#ffffff", "COLOR")
          .setUsername(member.user.displayName);

        await rank.build({}).then((data) => {
          interaction.reply({
            files: [new AttachmentBuilder(data, { name: "rank.png" }).build()],
          });
        });
        break;
      case "reset":
        const member2 =
          interaction.options.getMember("user") || interaction.member;

        let user2;

        const guildId2 = member2.guild.id;
        const userId2 = member2.user.id;

        user2 = await xp.findOne({ guildId: guildId2, userId: userId2 });

        try {
          await xp
            .findOneAndUpdate(
              { guildId: guildId2, userId: userId2 },
              { level: 1, xp: 0 },
              { upsert: true, new: true }
            )
            .then(() =>
              interaction.reply({
                content: `Successfully reset ${member2.displayName}'s rank`,
              })
            );
        } catch (error) {
          log(`${__filename}`, `An error has occurred: ${error}`, "err");
        }
        break;
      case "set":
        const member3 =
          interaction.options.getMember("user") || interaction.member;
        const level = interaction.options.getInteger("level");

        let user3;

        const guildId3 = member3.guild.id;
        const userId3 = member3.user.id;

        user3 = await xp.findOne({ guildId: guildId3, userId: userId3 });

        try {
          await xp
            .findOneAndUpdate(
              { guildId: guildId3, userId: userId3 },
              { level: level, xp: 0 },
              { upsert: true, new: true }
            )
            .then(() =>
              interaction.reply({
                content: `Successfully set ${member3.displayName}'s rank to ${level}`,
              })
            );
        } catch (error) {
          log(`${__filename}`, `An error has occurred: ${error}`, "err");
        }
        break;

      default:
        break;
    }
  },
};
