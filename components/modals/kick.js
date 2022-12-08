const {
  ModalBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const client = require("../../index");
const moderateSchema = require("../../Systems/models/Moderations");

module.exports = {
  data: {
    name: `kick-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        ephemeral: true,
        content: "You do not have permission to kick members!",
      });
    }

    const kickDate = new Date(
      interaction.createdTimestamp
    ).toLocaleDateString();
    const reason = interaction.fields.getTextInputValue("kick-reason");

    const data = await moderateSchema.findOne({
      GuildID: interaction.guild.id,
    });
    if (!data) {
      return interaction.reply({
        content: "An error has occured.",
        ephemeral: true,
      });
    }

    const user = data.UserID;
    const member = interaction.guild.members.cache.get(user);

    if (!member) {
      return interaction.reply({
        content: "That user is not in this server!",
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: `I cannot kick ${member.user.tag} because they have a role that is equal or higher then mine!`,
        ephemeral: true,
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot kick yourself!",
        ephemeral: true,
      });
    }

    await member
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`You have been kicked`)
            .setDescription(
              `Executed by: ${interaction.user}\nReason: ${reason}\nExecuted on: ${kickDate}`
            ),
        ],
      })
      .catch(() => {
        interaction.reply({
          content: `I cannot send a message to ${member.user.tag}!`,
          ephemeral: true,
        });
      });

    await member
      .kick(reason)
      .then(() => {
        interaction.reply({
          content: `Successfully kicked ${member.user.tag}!`,
        });
        const moderateContent = {
          ExecuterId: member.id,
          ExecutedBy: member.user.tag,
          ExecutedOn: kickDate,
          Reason: reason,
          Type: "Ban",
        };
        data.Content.push(moderateContent);
        data.save();
      })
      .catch((err) => {
        interaction.reply({
          content: `I was unable to kick ${member.user.tag}! The error was reported to the developers.`,
        });
        console.error(err);
      });
  },
};
