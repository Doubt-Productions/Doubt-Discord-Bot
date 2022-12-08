const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const AutoMod = require("../../Systems/models/AutoMod");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-schema")
    .setDescription("Create the missing automod schema")
    .setDefaultMemberPermissions(0),
  category: "General",
  /**
   *
   * @param {*} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const { guildId } = interaction;

    const guilds = await client.guilds.fetch();

    for (const guild of guilds.values()) {
      const guildId = guild.id;

      AutoMod.findOne({ Guild: guildId }, async (err, data) => {
        if (err) throw err;
        if (data) return;
        if (!data) {
          AutoMod.create({
            Guild: guildId,
            AntiCaps: false,
            AntiLink: false,
            AntiMassMention: false,
            AntiMassMentionCount: 0,
            AntiPhishing: false,
            AntiSpam: false,
          });
        }
      });
    }
    return interaction.reply({ content: "Created" });
  },
};
