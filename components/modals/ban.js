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
    name: `ban-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        ephemeral: true,
        content: "You do not have permission to ban members!",
      });
    }

    const banDate = new Date(interaction.createdTimestamp).toLocaleDateString();
    const reason = interaction.fields.getTextInputValue("ban-reason");

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

    if (!member.bannable) {
      return interaction.reply({
        content: `I cannot ban ${member.user.tag} because they have a role that is equal or higher then mine!`,
        ephemeral: true,
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot ban yourself!",
        ephemeral: true,
      });
    }

    await member
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`You have been Banned`)
            .setDescription(
              `Executed by: ${interaction.user}\nReason: ${reason}\nExecuted on: ${banDate}`
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
      .ban({ reason, days: 7 })
      .then(() => {
        interaction.reply({
          content: `Successfully Banned ${member.user.tag}!`,
        });
        const moderateContent = {
          ExecuterId: member.id,
          ExecutedBy: member.user.tag,
          ExecutedOn: banDate,
          Reason: reason,
          Type: "Ban",
        };
        data.Content.push(moderateContent);
        data.save();
      })
      .catch((err) => {
        interaction.reply({
          content: `An error has occured: ${err}`,
          ephemeral: true,
        });
        console.error(err);
      });
  },
};
