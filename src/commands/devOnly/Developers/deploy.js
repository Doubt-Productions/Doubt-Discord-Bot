const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const deploy = require("../../../handlers/deploy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deploy")
    .setDescription("Deploys all the commands to the discord api!"),
  options: {
    developers: true,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    interaction.reply({
      content: `Starting to deploy commands!`,
      ephemeral: true,
    });

    await deploy(client);

    interaction.editReply({
      content: `Successfully deployed commands!`,
      ephemeral: true,
    });
  },
};
