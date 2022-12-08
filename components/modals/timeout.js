const {
  ModalBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const client = require("../../index");
const moderateSchema = require("../../Systems/models/Moderations");
const ms = require("ms");

module.exports = {
  data: {
    name: `timeout-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    const { options, guild, member } = interaction;

    const reason =
      interaction.fields.getTextInputValue("timeout-reason") ||
      "No reason provided";

    const newInfractionObject = {
      ExecuterId: member.id,
      ExecutedBy: member.user.tag,
      ExecutedOn: new Date(interaction.createdTimestamp).toLocaleDateString(),
      Reason: reason,
      Type: "Timeout",
    };

    let userData = await moderateSchema.findOne({ GuildID: guild.id });
    if (!userData)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("An error has occured.")
            .setDescription("Please try again later.")
            .setColor("Red"),
        ],
      });
    else userData.Content.push(newInfractionObject) && userData.save();

    const target = guild.members.cache.get(userData.UserID);
    const time = interaction.fields.getTextInputValue("timeout-time");

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
