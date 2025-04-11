const {
  StringSelectMenuInteraction,
  EmbedBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageCollector,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const welcomeSchema = require("../../schemas/welcomeSchema");
const { RoleSelectMenuBuilder } = require("@discordjs/builders");

module.exports = {
  customId: "welcomeSSM",
  /**
   *
   * @param {ExtendedClient} client
   * @param {StringSelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
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

    const data = await welcomeSchema.findOne({
      Guild: interaction.guildId,
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
          filter: (i) => i.customId === "welcomeCSM1",
          time: 30000,
        });

        collector.on("collect", async (i) => {
          if (i.isChannelSelectMenu()) {
            const channel = i.values[0];

            if (!data) {
              await new welcomeSchema({
                Guild: interaction.guildId,
                Channel: channel,
              }).save();

              embed.setDescription(
                `The welcome channel has been set to <#${channel}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.findOneAndUpdate(
                {
                  Guild: interaction.guildId,
                },
                {
                  Channel: channel,
                }
              );

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
      case "message":
        embed.setDescription(
          "Type the message you want to send!\n\n`💡` You can use the variable {RULES} to mention the rules channel.\n\n`💡` You can use {USER} to mention the user."
        );

        await interaction.update({
          embeds: [embed],
          components: [goBackRow],
        });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector2 = new MessageCollector(interaction.channel, {
          filter,
          time: 60000,
          max: 1,
        });

        collector2.on("collect", async (msg) => {
          if (msg.content) {
            collector2.stop();
            embed.setDescription(
              `Message: \n\`\`\`${msg.content}\`\`\`\n\nIs this the message you want to send?`
            );

            const confirmBtn = new ButtonBuilder()
              .setCustomId("wcmConfirmBtn")
              .setLabel("Confirm")
              .setStyle(ButtonStyle.Success);

            const cancelBtn = new ButtonBuilder()
              .setCustomId("wcmCancelBtn")
              .setLabel("Cancel")
              .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(
              confirmBtn,
              cancelBtn
            );

            const reply = await interaction.editReply({
              embeds: [embed],
              components: [row],
            });

            const filter = (button) => button.user.id === interaction.user.id;
            const collector = reply.createMessageComponentCollector({
              filter,
              time: 30000,
            });

            collector.on("collect", async (i) => {
              if (i.customId === "wcmConfirmBtn") {
                collector.stop();
                embed.setDescription(
                  `The message has been set to \n\`\`\`${msg.content}\`\`\`\n\n\`💡\` You can continue the setup by pressing \`Go back\``
                );

                if (!data) {
                  await new welcomeSchema({
                    Guild: interaction.guildId,
                    Message: msg.content,
                  }).save();

                  await i.update({
                    embeds: [embed],
                    components: [goBackRow],
                  });
                } else {
                  await welcomeSchema.findOneAndUpdate(
                    {
                      Guild: interaction.guildId,
                    },
                    {
                      Message: msg.content,
                    }
                  );

                  await i.update({
                    embeds: [embed],
                    components: [goBackRow],
                  });
                }
              } else if (i.customId === "wcmCancelBtn") {
                collector.stop();
                embed.setDescription(
                  `You have cancelled the message setup! Please try again.`
                );

                await i.update({
                  embeds: [embed],
                  components: [goBackRow],
                });
              }
            });
          }
        });
        break;
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
          filter: (i) => i.customId === "welcomeCSM2",
          time: 30000,
        });

        collector3.on("collect", async (i) => {
          if (i.isChannelSelectMenu()) {
            const rulesChannel = i.values[0];

            if (!data) {
              await new welcomeSchema({
                Guild: interaction.guildId,
                Rules: rulesChannel,
              }).save();

              embed.setDescription(
                `The rules channel has been set to <#${rulesChannel}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.findOneAndUpdate(
                {
                  Guild: interaction.guildId,
                },
                {
                  Rules: rulesChannel,
                }
              );

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
          filter: (i) => i.customId === "welcomeRSM1",
          time: 30000,
        });

        collector4.on("collect", async (i) => {
          if (i.isRoleSelectMenu()) {
            const memberRole = i.values[0];

            if (!data) {
              await new welcomeSchema({
                Guild: interaction.guildId,
                MemberRole: memberRole,
              }).save();

              embed.setDescription(
                `The member role has been set to <@&${memberRole}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.findOneAndUpdate(
                {
                  Guild: interaction.guildId,
                },
                {
                  MemberRole: memberRole,
                }
              );

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
          filter: (i) => i.customId === "welcomeRSM2",
          time: 30000,
        });

        collector5.on("collect", async (i) => {
          if (i.isRoleSelectMenu()) {
            const botRole = i.values[0];

            if (!data) {
              await new welcomeSchema({
                Guild: interaction.guildId,
                BotRole: botRole,
              }).save();

              embed.setDescription(
                `The member role has been set to <@&${botRole}>! You can continue the setup by pressing \`Go back\``
              );

              await interaction.editReply({
                embeds: [embed],
                components: [goBackRow],
              });
            } else {
              await welcomeSchema.findOneAndUpdate(
                {
                  Guild: interaction.guildId,
                },
                {
                  BotRole: botRole,
                }
              );

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
