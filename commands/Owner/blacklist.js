const {
  EmbedBuilder,
  SlashCommandBuilder,
  Client,
  CommandInteraction,
} = require("discord.js");
const DBG = require("../../Systems/models/BlacklistG");
const DBU = require("../../Systems/models/BlacklistUser");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Blacklist a user or server.")
    .setDefaultMemberPermissions(0)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Choose an option")
        .setRequired(true)
        .addChoices(
          { name: "User", value: "user" },
          { name: "Server", value: "server" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The ID of the user or server")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Provide a reason for blacklisting.")
        .setRequired(true)
    ),
  ownerOnly: true,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    const { options, user, member } = interaction;

    const Options = options.getString("type");
    const ID = options.getString("id");
    const Reason = options.getString("reason");

    if (user.id !== config.Users.ADMINS.toString()) {
      return interaction.reply({
        content: `❌ - This command is only available for bot administrators!`,
        ephemeral: true,
      });
    }

    if (isNaN(ID))
      return interaction.reply({
        content: `❌ - Invalid ID!`,
        ephemeral: true,
      });

    switch (Options) {
      case "server":
        {
          const Guild = client.guilds.cache.get(ID);

          let GName;
          let GID;

          if (Guild) {
            GName = Guild.name;
            GID = Guild.id;
          } else {
            GName = "Unknown";
            GID = ID;
          }

          let Data = await DBG.findOne({ Guild: GID }).catch((err) => {});

          if (!Data) {
            Data = new DBG({
              Guild: GID,
              Reason,
              Time: Date.now(),
            });

            await Data.save();

            interaction.reply({
              content: `✅ - I have blacklisted **${GName} (\`${GID}\`)** from using this bot! Reason: **${Reason}**`,
            });
          } else {
            interaction.reply({
              content: `❌ - This server is already blacklisted!`,
              ephemeral: true,
            });
          }
        }
        break;

      case "user":
        {
          let Member;
          let UName;
          let UID;

          const User = client.users.cache.get(ID);

          if (User) {
            Member = User;
            UName = User.username;
            UID = User.id;
          } else {
            Member = "Unknown User#0000";
            UName = "Unknown User#0000";
            UID = ID;
          }

          let Data = await DBU.findOne({ User: UID }).catch((err) => {});

          if (!Data) {
            Data = new DBU({
              User: UID,
              Reason,
              Time: Date.now(),
            });

            await Data.save();

            interaction.reply({
              content: `✅ - I have blacklisted **${Member} (${UName} | \`${UID}\`)** from using this bot! Reason: **${Reason}**`,
            });
          } else {
            interaction.reply({
              content: `❌ - This user is already blacklisted!`,
              ephemeral: true,
            });
          }
        }
        break;
    }
  },
};
