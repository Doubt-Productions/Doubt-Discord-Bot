const {
  StringSelectMenuInteraction,
  EmbedBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const welcomeSchema = require("../../schemas/welcomeSchema");
const { RoleSelectMenuBuilder } = require("@discordjs/builders");
const {
  denyUnlessManageGuild,
  setupComponentFilter,
} = require("../../utils/setupGuard");

module.exports = {
  customId: "welcomeSSM",
  /**
   *
   * @param {ExtendedClient} client
   * @param {StringSelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    if (!(await denyUnlessManageGuild(interaction))) return;

    const value = interaction.values[0];

    const embed = new EmbedBuilder()
      .setTitle("👋 | Welcome System")
      .setFooter({
        text: `©️ Doubt Productions | Welcome System | ${value}`,
      })
      .setTimestamp();

    const goBackBtn = new ButtonBuilder()
      .setCustomId("wcmGoBackBtn")
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary);

    const goBackRow = new ActionRowBuilder().addComponents(goBackBtn);

    const data = await welcomeSchema.findFirst({
      where: { Guild: interaction.guildId },
    });

    switch (value) {
      case "channel":
        embed.setDescription(
          "Select the channel where you want to send the welcome message!"
        );

        const welcomeCSM1 = new ChannelSelectMenuBuilder()
          .setCustomId("welcomeCSM1")
          .setPlaceholder("Select a channel")
          .setMinValues(1)
          .setMaxValues(1)
          .addChannelTypes(ChannelType.GuildText);

        const row = new ActionRowBuilder().addComponents(welcomeCSM1);

        interaction.update({
          embeds: [embed],
          components: [row, goBackRow],
        });

        const collector = interaction.channel.createMessageComponentCollector({
          filter: setupComponentFilter(interaction, "welcomeCSM1"),
          time: 30000,
        });

        collector.on("collect", async (i) => {
          if (i.isChannelSelectMenu()) {
            const channel = i.values[0];

            if (!data) {
              await welcomeSchema.create({
                data: {
                  Guild: interaction.guildId,
                  Channel: channel,
                },
              });

              embed.setDescription(
                `The welcome channel has been set to <#${channel}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.update({
                where: { id: data.id },
                data: { Channel: channel },
              });

              embed.setDescription(
                `The welcome channel has been set to <#${channel}>! You can continue the setup by pressing \`Go back\``
              );

              await i.update({
                embeds: [embed],
                components: [goBackRow],
              });
            }
          }
        });
        break;
      case "message": {
        const messageInput = new TextInputBuilder()
          .setCustomId("welcomeMessage")
          .setLabel("Welcome message")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Use {user} and {rules} as variables")
          .setRequired(true)
          .setMaxLength(2000);

        if (data?.Message) {
          messageInput.setValue(data.Message.slice(0, 2000));
        }

        const modal = new ModalBuilder()
          .setCustomId("welcome-message-modal")
          .setTitle("Welcome message")
          .addComponents(new ActionRowBuilder().addComponents(messageInput));

        await interaction.showModal(modal);
        break;
      }
      case "rules-channel":
        const welcomeCSM2 = new ChannelSelectMenuBuilder()
          .setCustomId("welcomeCSM2")
          .setPlaceholder("Select a channel")
          .setMinValues(1)
          .setMaxValues(1)
          .addChannelTypes(ChannelType.GuildText);

        const row2 = new ActionRowBuilder().addComponents(welcomeCSM2);

        interaction.update({
          embeds: [embed.setDescription("Select the rules channel!")],
          components: [row2, goBackRow],
        });

        const collector3 = interaction.channel.createMessageComponentCollector({
          filter: setupComponentFilter(interaction, "welcomeCSM2"),
          time: 30000,
        });

        collector3.on("collect", async (i) => {
          if (i.isChannelSelectMenu()) {
            const rulesChannel = i.values[0];

            if (!data) {
              await welcomeSchema.create({
                data: {
                  Guild: interaction.guildId,
                  Rules: rulesChannel,
                },
              });

              embed.setDescription(
                `The rules channel has been set to <#${rulesChannel}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.update({
                where: { id: data.id },
                data: { Rules: rulesChannel },
              });

              embed.setDescription(
                `The rules channel has been set to <#${rulesChannel}>! You can continue the setup by pressing \`Go back\``
              );

              await i.update({
                embeds: [embed],
                components: [goBackRow],
              });
            }
          }
        });

        break;
      case "member-role":
        const welcomeRSM1 = new RoleSelectMenuBuilder()
          .setCustomId("welcomeRSM1")
          .setPlaceholder("Select a role")
          .setMinValues(1)
          .setMaxValues(1);

        const row3 = new ActionRowBuilder().addComponents(welcomeRSM1);

        interaction.update({
          embeds: [embed.setDescription("Select the member role!")],
          components: [row3, goBackRow],
        });

        const collector4 = interaction.channel.createMessageComponentCollector({
          filter: setupComponentFilter(interaction, "welcomeRSM1"),
          time: 30000,
        });

        collector4.on("collect", async (i) => {
          if (i.isRoleSelectMenu()) {
            const memberRole = i.values[0];

            if (!data) {
              await welcomeSchema.create({
                data: {
                  Guild: interaction.guildId,
                  MemberRole: memberRole,
                },
              });

              embed.setDescription(
                `The member role has been set to <@&${memberRole}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.update({
                where: { id: data.id },
                data: { MemberRole: memberRole },
              });

              embed.setDescription(
                `The member role has been set to <@&${memberRole}>! You can continue the setup by pressing \`Go back\``
              );

              await i.update({
                embeds: [embed],
                components: [goBackRow],
              });
            }
          }
        });

        break;
      case "bot-role":
        const welcomeRSM2 = new RoleSelectMenuBuilder()
          .setCustomId("welcomeRSM2")
          .setPlaceholder("Select a role")
          .setMinValues(1)
          .setMaxValues(1);

        const row4 = new ActionRowBuilder().addComponents(welcomeRSM2);

        interaction.update({
          embeds: [embed.setDescription("Select the member role!")],
          components: [row4, goBackRow],
        });

        const collector5 = interaction.channel.createMessageComponentCollector({
          filter: setupComponentFilter(interaction, "welcomeRSM2"),
          time: 30000,
        });

        collector5.on("collect", async (i) => {
          if (i.isRoleSelectMenu()) {
            const botRole = i.values[0];

            if (!data) {
              await welcomeSchema.create({
                data: {
                  Guild: interaction.guildId,
                  BotRole: botRole,
                },
              });

              embed.setDescription(
                `The member role has been set to <@&${botRole}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.update({
                where: { id: data.id },
                data: { BotRole: botRole },
              });

              embed.setDescription(
                `The member role has been set to <@&${botRole}>! You can continue the setup by pressing \`Go back\``
              );

              await i.update({
                embeds: [embed],
                components: [goBackRow],
              });
            }
          }
        });
        break;
      default:
        interaction.update({
          content: "An error occurred!",
          components: [],
        });
        break;
    }
  },
};
