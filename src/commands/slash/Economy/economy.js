const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("economy")
    .setDescription("Create your economy account!"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { user, guild } = interaction;

    let Data = await ecoSchema.findOne({
      Guild: guild.id,
      User: user.id,
    });
    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`Account`)
      .setDescription(
        `You ${
          Data ? "`do`" : "`do not`"
        } have an account\n\nChoose your option.`
      )
      .addFields({ name: `Create`, value: `Create your economy account!` })
      .addFields({ name: `Delete`, value: `Delete your economy account!` });

    const embed2 = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`Created your account!`)
      .setDescription(`Account Created.`)
      .addFields({
        name: `Success`,
        value: `Your account has been successfully created! You have got $1000 uppon creating your account!`,
      })
      .setFooter({ text: `XenoPVP` })
      .setTimestamp();

    const embed3 = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`Deleted your account!`)
      .setDescription(`Account Deleted.`)
      .addFields({
        name: `Success`,
        value: `Your account has been successfully deleted! `,
      })
      .setFooter({ text: `XenoPVP` })
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("page1")
        .setLabel("Create")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("✅"),

      new ButtonBuilder()
        .setCustomId("page2")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❌")
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [button],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;

    const collector = await message.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "page1") {
        Data = new ecoSchema({
          Guild: guild.id,
          User: user.id,
          Wallet: 0,
          Bank: 1000,
        });

        await Data.save();

        await i.update({
          embeds: [embed2],
          components: [],
        });
      }
      if (i.customId === "page2") {
        await Data.deleteMany();

        await i.update({
          embeds: [embed3],
          components: [],
        });
      }
    });
  },
};
