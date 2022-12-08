const {
  EmbedBuilder,
  Client,
  CommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simulate")
    .setDescription("Simulate a join or leave event.")
    .setDefaultMemberPermissions(0)
    .addStringOption((option) => 
      option
        .setName("type")
        .setDescription("Choose an option")
        .setRequired(true)
        .addChoices(
          { name: "Join", value: "join" },
          { name: "Leave", value: "leave" }
        )
    ),
  category: "Owner",
  options: [],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {config} config
   
   */
  run: async (client, interaction, config, db) => {
    await interaction.deferReply({ ephemeral: true });

    const { options, user, member } = interaction;

    const Options = options.getString("type");

    if (user.id !== config.Users.ADMINS.toString())
      return interaction.editReply(
        `❌ - This command is only available for bot administrators!`
      );

    switch (Options) {
      case "join":
        {
          interaction.editReply(`✅ - Simulated join event!`);
          client.emit("guildMemberAdd", member);
        }
        break;

      case "leave":
        {
          interaction.editReply(`✅ - Simulated leave event!`);
          client.emit("guildMemberRemove", member);
        }
        break;
    }
  },
};
