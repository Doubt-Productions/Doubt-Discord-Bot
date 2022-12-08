const {
  ModalBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
} = require("discord.js");
const client = require("../../index");
const logSchema = require("../../Systems/models/logsChannel");

module.exports = {
  data: {
    name: `logging-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    const { channel, guildId, options } = interaction;

    const logChannel = interaction.guild.channels.cache.get(interaction.fields.getTextInputValue("logging-channel"))
    const embed = new EmbedBuilder();

    logSchema.findOne({ Guild: guildId }, async (err, data) => {
      if (!data) {
        await logSchema.create({
          Guild: guildId,
          Channel: logChannel.id,
        });

        embed
          .setDescription("Data was successfully sent to the database!")
          .setColor("Green")
          .setTimestamp();
      } else if (data) {
        logSchema.deleteOne({ Guild: guildId });
        await logSchema.create({
          Guild: guildId,
          Channel: logChannel.id,
        });

        embed
          .setDescription(
            "Old data was successfully replaced with the new data!"
          )
          .setColor("Green")
          .setTimestamp();
      }

      if (err) {
        embed
          .setDescription("An error occurred while saving the data!")
          .addFields({ name: "Error:", value: `\`\`\`${err}\`\`\`` })
          .setColor("Red")
          .setTimestamp();
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    });
  },
};
