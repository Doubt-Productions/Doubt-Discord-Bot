const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const welcomeSchema = require("../../../schemas/welcomeSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("setup-welcome")
    .setDescription("Setup welcome system!")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send welcome message!")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message to send!")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName(`rules-channel`)
        .setDescription(`Channel to send rules and info!`)
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName(`member-role`)
        .setDescription(`Role to give to members!`)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName(`bot-role`)
        .setDescription(`Role to give to bots!`)
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const { options, guild } = interaction;
    const memberRole = options.getRole("member-role");
    const botRole = options.getRole("bot-role");

    const channel = options.getChannel("channel");
    const rules = options.getChannel("rules-channel");
    const message = options.getString("message");

    const embed = new EmbedBuilder()
      .setTitle(`Welcome System`)
      .setColor(`Blurple`)
      .setDescription(
        `Setup the welcome system. Press confirm to continue! Useful tips: You can use {user} and {rules} and {server} in the message!`
      )
      .addFields(
        {
          name: `Channel`,
          value: `${channel}`,
        },
        {
          name: `Message`,
          value: `${message}`,
        },
        {
          name: `Rules Channel`,
          value: `${rules}`,
        },
        {
          name: `Member Role`,
          value: `${memberRole}`,
        },
        {
          name: `Bot Role`,
          value: `${botRole}`,
        }
      );
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId("welcome-confirm")
      .setLabel("Confirm")
      .setEmoji("✅");

    const button2 = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId("welcome-cancel")
      .setLabel("Cancel")
      .setEmoji("❌");

    const row = new ActionRowBuilder().addComponents(button, button2);

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const filter = (button) => button.user.id === interaction.user.id;
    const collector = reply.createMessageComponentCollector(filter, {
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "welcome-confirm") {
        const data = await welcomeSchema.findOne({ Guild: guild.id });
        if (data) {
          await welcomeSchema.findOneAndDelete({ Guild: guild.id });
        }

        await welcomeSchema.findOneAndUpdate(
          {
            Guild: guild.id,
          },
          {
            Guild: guild.id,
            Channel: channel.id,
            Message: message,
            Rules: rules.id,
            MemberRole: memberRole.id,
            BotRole: botRole.id,
          },
          {
            upsert: true,
          }
        );

        const embed = new EmbedBuilder()
          .setTitle(`Welcome System`)
          .setColor(`Blurple`)
          .setDescription(`Welcome system has been setup!`);

        await i.update({
          embeds: [embed],
          components: [],
        });
      } else if (i.customId === "welcome-cancel") {
        const embed = new EmbedBuilder()
          .setTitle(`Welcome System`)
          .setColor(`Blurple`)
          .setDescription(`Welcome system has been canceled!`);
        await i.update({
          embeds: [embed],
          components: [],
        });
      }
    });
  },
};
