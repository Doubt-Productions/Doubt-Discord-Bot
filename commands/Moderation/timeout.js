const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const DB = require("../../Systems/models/Moderations");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Limit the user's ability to send messages.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time to timeout the user. (1m, 1h, 1d, 1w")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the timeout.")
        .setRequired(false)
        .setMaxLength(512)
    ),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { options, guild, member } = interaction;

    const target = options.getMember("user");
    const reason = options.getString("reason") || "No reason provided";
    const time = options.getString("time");

    const errorsArray = [];

    const errorsEmbed = new EmbedBuilder()
      .setColor("Red")
      .setAuthor({ name: "Could not timeout member due to" });

    if (!target)
      return interaction.reply({
        embeds: [
          errorsEmbed.setDescription(`Member was not found. Did they leave?`),
        ],
        ephemeral: true,
      });

    if (!ms(time) || ms(time) > ms("28d"))
      errorsArray.push(
        `Time provided is invalid or over the limit of 28 days.`
      );

    if (!target.manageable || !target.moderatable)
      errorsArray.push(
        `Selected target is not manageable by this bot. Please check my role position in order to resolve this issue.`
      );

    if (member.roles.highest.position < target.roles.highest.position)
      errorsArray.push(
        `Selected target has a higher role position then you. If you believe this to be a mistake contact the server administrator`
      );

    if (errorsArray.length) {
      return interaction.reply({
        embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });
    }

    target.timeout(ms(time), reason).catch((err) => {
      interaction.reply({
        embeds: [
          errorsEmbed.setDescription(
            `An error occured while trying to timeout the member. Please try again later.`
          ),
        ],
        ephemeral: true,
      });
      return console.log(
        "An unknown error occured while trying to timeout a member",
        err
      );
    });

    const newInfractionObject = {
      ExecuterId: member.id,
      ExecutedBy: member.user.tag,
      ExecutedOn: new Date(interaction.createdTimestamp).toLocaleDateString(),
      Reason: reason,
      Type: "Timeout",
    };

    let userData = await DB.findOne({ GuildID: guild.id, UserID: target.id });
    if (!userData)
      userData = await DB.create({
        GuildID: guild.id,
        UserID: target.id,
        Content: [newInfractionObject],
      });
    else userData.Content.push(newInfractionObject) && userData.save();

    const successEmbed = new EmbedBuilder()
      .setColor("DarkAqua")
      .setAuthor({
        name: "Timeout Issued",
        iconURL: guild.iconURL({ dynamic: true }),
      })
      .setDescription(
        [
          `**Target:** \`${target.user.tag}\` (${target.id})
            **Time:** ${ms(ms(time), { long: true })}
            **Reason:** ${reason}
            **Executed By:** \`${member.user.tag}\` (${member.id})
            **Executed On:** ${new Date(
              interaction.createdTimestamp
            ).toLocaleDateString()}
            `,
        ].join("\n")
      );

    return interaction.reply({ embeds: [successEmbed] });
  },
};
