const {
  EmbedBuilder,
  Client,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
  ButtonStyle,
  SlashCommandBuilder,
  ChannelType,
} = require("discord.js");
const Config = require("../../config/config.json");
const VDB = require("../../Systems/models/Verification");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify yourself to gain access to the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role you want to verify for.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel you want to verify in.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  category: "Admin",
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {Config} config
   */
  run: async (client, interaction, config) => {
    const { options, guild } = interaction;

    const role = options.getRole("role");
    const Channel = options.getChannel("channel");

    let Data = await VDB.findOne({ Guild: guild.id }).catch((err) => {});

    if (!Data) {
      Data = new VDB({
        Guild: guild.id,
        Role: role.id,
        Channel: Channel.id,
      });

      await Data.save();
      console.log(`Saved date to the database.`);
    } else if (Data) {
      Data.Role = role.id;

      await Data.save();
    }

    Channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#ff0357")
          .setTitle(`✅ | Verification`)
          .setDescription("Click the button to verify.")
          .setTimestamp(),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("verify")
            .setLabel("Verify")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Secondary)
        ),
      ],
    });

    interaction.reply({
      content: `✅ | Successfully sent the verification panel in ${Channel}`,
      ephemeral: true,
    });
  },
};
