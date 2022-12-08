const {
  ModalBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
} = require("discord.js");
const client = require("../../index");
const AutoMod = require("../../Systems/models/AutoMod");
const AntiSpam = require("discord-anti-spam");

module.exports = {
  data: {
    name: `antispam-modal`,
  },
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {client} client
   */
  async execute(interaction, client) {
    console.log(`[MODAL] ${interaction.user.tag} used the Anti Spam Modal`);
    const { member, guild, guildId, fields } = interaction;

    const embed = new EmbedBuilder();

    const enabled = fields.getTextInputValue("antispam-enabled").toLowerCase();
    const channel = interaction.guild.channels.cache.get(
      fields.getTextInputValue("antispam-channel")
    );

    try {
      const data = await AutoMod.findOne({
        Guild: guildId,
      });
      if (!data) {
        const newData = new AutoMod({
          Guild: guildId,
          AntiSpam: enabled,
          AntiSpamChannel: channel.id,
        });
        newData.save();
      } else if (data) {
        data.AntiSpam = enabled;
        data.AntiSpamChannel = channel.id;
        data.save();
      }

      embed
        .setTitle("Anti Spam")
        .setDescription("Anti Spam has been set to " + enabled)
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

      await interaction.reply({ embeds: [embed] });
    }
  },
};
