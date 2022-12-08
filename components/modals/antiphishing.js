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
    name: `antiphishing-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    const { member, guild, guildId, fields } = interaction;

    const embed = new EmbedBuilder();

    const enabled = fields.getTextInputValue("antiphishing-enabled").toLowerCase();
    const channel = interaction.guild.channels.cache.get(
      fields.getTextInputValue("antiphishing-channel")
    );

    try {
      const data = await AutoMod.findOne({
        GuildID: guildId,
      });
      if (!data) {
        const newData = new AutoMod({
          Guild: guildId,
          AntiPhishing: enabled,
          AntiPhishingChannel: channel.id,
        });
        newData.save();
      } else if (data) {
        data.AntiPhishing = enabled;
        data.save();
      }

      embed
        .setTitle("Anti Phishing")
        .setDescription("Anti Phishing has been set to " + enabled)
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
