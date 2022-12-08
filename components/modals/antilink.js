const {
  ModalBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
} = require("discord.js");
const client = require("../../index");
const AutoMod = require("../../Systems/models/AutoMod");

module.exports = {
  data: {
    name: `antilink-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    const { member, guild, guildId, fields } = interaction;

    const embed = new EmbedBuilder();

    const enabled = fields.getTextInputValue("antilink-enabled");

    try {
      const data = await AutoMod.findOne({
        GuildID: guildId,
      });
      if (!data) {
        const newData = new AutoMod({
          Guild: guildId,
          AntiLink: enabled,
        });
        newData.save();
      } else if (data) {
        data.AntiLink = enabled;
        data.save();
      }

      embed
        .setTitle("Anti-Link")
        .setDescription("Anti-Link has been set to " + enabled)
        .setColor("Green");

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      embed
        .setTitle("Error")
        .setDescription("An error occured while setting Anti-Link")
        .setFooter({
          text: `The error has been reported to the developers.`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red");
    }
  },
};
