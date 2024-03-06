const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonInteraction,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const welcomeSchema = require("../../../schemas/welcomeSchema");
const chatbotSchema = require("../../../schemas/chatbotSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup command!"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const { options, guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle(`Setup`)
      .setDescription(`Welcome to the setup!`)
      .setColor("Blurple")
      .addFields(
        {
          name: "Welcome",
          value:
            "Please use the command `/setup-welcome` to setup welcome system!",
          inline: true,
        },
        {
          name: "Ticket",
          value:
            "Please use the command `/setup-ticket` to setup ticket system!",
          inline: true,
        }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`setup-welcome`)
        .setLabel(`Welcome`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`setup-ticket`)
        .setLabel(`Ticket`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`setup-logs`)
        .setLabel(`Logs`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = reply.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on(
      "collect",
      /**
       *
       * @param {ButtonInteraction} i
       */
      async (i) => {
        if (i.customId === "setup-welcome") {
          const welcomeData = await welcomeSchema.findOne({ Guild: guild.id });

          const initialWelcomeEmbed = new EmbedBuilder()
            .setTitle(`Doubt | Setup welcome`)
            .setColor("Blurple")
            .setDescription(
              `Welcome to the setup! Please follow the instructions below!`
            )
            .addFields(
              {
                name: `Channels`,
                value: `Setup the channels for the welcome system!`,
              },
              {
                name: `Message`,
                value: `Setup the message for the welcome system!`,
              },
              {
                name: `Roles`,
                value: `Setup the roles for the welcome system!`,
              }
            );

          const channelButton = new ButtonBuilder()
            .setCustomId(`setup-welcome-channels`)
            .setLabel(`Channels`)
            .setStyle(ButtonStyle.Primary);

          const messageButton = new ButtonBuilder()
            .setCustomId(`setup-welcome-message`)
            .setLabel(`Message`)
            .setStyle(ButtonStyle.Primary);

          const rolesButton = new ButtonBuilder()
            .setCustomId(`setup-welcome-roles`)
            .setLabel(`Roles`)
            .setStyle(ButtonStyle.Primary);

          const row = new ActionRowBuilder().addComponents(
            channelButton,
            messageButton,
            rolesButton
          );

          const reply = await i.editReply({
            embeds: [initialWelcomeEmbed],
            components: [row],
          });

          const filter = (i) => i.user.id === interaction.user.id;
          const collector = reply.createMessageComponentCollector({
            filter,
            time: 60000,
          });

          collector.on(
            "collect",
            /**
             *
             * @param {ButtonInteraction} i
             */
            async (i) => {
              if (i.customId === "setup-welcome-channels") {
                const channelEmbed = new EmbedBuilder()
                  .setTitle(`Doubt | Setup welcome`)
                  .setColor("Blurple")
                  .setDescription(
                    `Please select the channel to send the welcome messages to!`
                  );

                const channelSelect = new ChannelSelectMenuBuilder()
                  .setCustomId(`setup-welcome-channels-select`)
                  .setPlaceholder(`Select a channel!`)
                  .setMinValues(1)
                  .setMaxValues(1)
                  .addChannelTypes(ChannelType.GuildText);

                const row = new ActionRowBuilder().addComponents(channelSelect);

                const reply = await i.editReply({
                  embeds: [channelEmbed],
                  components: [row],
                });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = reply.createMessageComponentCollector({
                  filter,
                  time: 60000,
                });

                collector.on(
                  "collect",
                  /**
                   *
                   * @param {ChannelSelectMenuInteraction} i
                   */
                  async (i) => {
                    if (i.customId === "setup-welcome-channels-select") {
                      const channel = i.values[0];

                      if (welcomeData) {
                        welcomeData.Channel = channel;
                        await welcomeData.save();

                        const channelEmbed = new EmbedBuilder()
                          .setTitle(`Doubt | Setup welcome`)
                          .setColor("Blurple")
                          .setDescription(
                            `Please select the channel which contains the rules!`
                          )
                          .addFields({
                            name: `Welcome channel`,
                            value: `<#${channel}>`,
                          });

                        const channelSelect = new ChannelSelectMenuBuilder()
                          .setCustomId(`setup-rules-channels-select`)
                          .setPlaceholder(`Select a channel!`)
                          .setMinValues(1)
                          .setMaxValues(1)
                          .addChannelTypes(ChannelType.GuildText);

                        const row = new ActionRowBuilder().addComponents(
                          channelSelect
                        );

                        const reply = await i.editReply({
                          embeds: [channelEmbed],
                          components: [row],
                        });

                        const filter = (i) => i.user.id === interaction.user.id;
                        const collector = reply.createMessageComponentCollector(
                          {
                            filter,
                            time: 60000,
                          }
                        );

                        collector.on(
                          "collect",
                          /**
                           *
                           * @param {ChannelSelectMenuInteraction} i
                           */
                          async (i) => {
                            if (i.customId === "setup-rules-channels-select") {
                              const channel = i.values[0];
                              welcomeData.Rules = channel;
                            }

                            await welcomeData.save();

                            const channelEmbed = new EmbedBuilder()
                              .setTitle(`Doubt | Setup welcome`)
                              .setColor("Blurple")
                              .setDescription(`Updated the channels!`)
                              .addFields(
                                {
                                  name: `Welcome channel`,
                                  value: `<#${welcomeData.Channel}>`,
                                },
                                {
                                  name: `Rules channel`,
                                  value: `<#${welcomeData.Rules}>`,
                                }
                              );
                          }
                        );
                      }

                      const welcomeData = new welcomeSchema({
                        Guild: guild.id,
                        Channel: channel,
                      });
                      await welcomeData.save();

                      const channelEmbed = new EmbedBuilder()
                        .setTitle(`Doubt | Setup welcome`)
                        .setColor("Blurple")
                        .setDescription(
                          `Please select the channel which contains the rules!`
                        )
                        .addFields({
                          name: `Welcome channel`,
                          value: `<#${channel}>`,
                        });

                      const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId(`setup-rules-channels-select`)
                        .setPlaceholder(`Select a channel!`)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addChannelTypes(ChannelType.GuildText);

                      const row = new ActionRowBuilder().addComponents(
                        channelSelect
                      );

                      const reply = await i.editReply({
                        embeds: [channelEmbed],
                        components: [row],
                      });

                      const filter = (i) => i.user.id === interaction.user.id;
                      const collector = reply.createMessageComponentCollector({
                        filter,
                        time: 60000,
                      });

                      collector.on(
                        "collect",
                        /**
                         *
                         * @param {ChannelSelectMenuInteraction} i
                         */
                        async (i) => {
                          if (i.customId === "setup-rules-channels-select") {
                            const channel = i.values[0];

                            welcomeData.Rules = channel;

                            await welcomeData.save();

                            const channelEmbed = new EmbedBuilder()
                              .setTitle(`Doubt | Setup welcome`)
                              .setColor("Blurple")
                              .setDescription(
                                `You successfully set the channels!`
                              )
                              .addFields(
                                {
                                  name: `Welcome channel`,
                                  value: `<#${welcomeData.Channel}>`,
                                },
                                {
                                  name: `Rules channel`,
                                  value: `<#${welcomeData.Rules}>`,
                                }
                              );

                            await i.editReply({
                              embeds: [channelEmbed],
                            });
                          }
                        }
                      );
                    }
                  }
                );
              } else if (i.customId === "setup-welcome-message") {
              } else if (i.customId === "setup-welcome-roles") {
              } else {
                return i.editReply({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle(`Doubt | Setup`)
                      .setDescription(
                        `This command is currently not ready for release. Please wait for the next update!`
                      )
                      .setTimestamp()
                      .setColor("Blurple")
                      .setFooter({ text: `Doubt | Setup` }),
                  ],
                });
              }
            }
          );
        } else if (i.customId === "setup-ticket") {
        } else if (i.customId === "setup-logs") {
        } else {
          return i.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Doubt | Setup`)
                .setDescription(
                  `This command is currently not ready for release. Please wait for the next update!`
                )
                .setTimestamp()
                .setColor("Blurple")
                .setFooter({ text: `Doubt | Setup` }),
            ],
          });
        }
      }
    );
  },
};
