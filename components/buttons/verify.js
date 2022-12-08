const { MessageComponentInteraction, Client } = require("discord.js");
const DB = require("../../Systems/models/Verification");

module.exports = {
  data: {
    name: "verify",
  },
  /**
   *
   * @param {MessageComponentInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, member, type } = interaction;

    const Data = await DB.findOne({ Guild: guild.id }).catch((err) => {});
    if (!Data) return interaction.reply(`❌ | No verification setup found`);

    const Role = guild.roles.cache.get(Data.Role);
    if (!Role)
      return interaction.reply({
        ephemeral: true,
        content: `❌ | No verification role found`,
      });

    if (member.roles.cache.has(Role.id))
      return interaction.reply(`❌ | You already have the verification role`);

    await member.roles.add(Role.id);

    interaction.reply({
      content: `✅ | You have been verified`,
      ephemeral: true,
    });
  },
};
