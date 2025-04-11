const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const { log } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Manage the automod system.")
    .addSubcommand((sub) =>
      sub
        .setName("flagged-words")
        .setDescription("Block profanity, sexual content, and slurs.")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel to send the alerts to.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("spam-messages")
        .setDescription("Block spam messages.")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel to send the alerts to.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("mention-spam")
        .setDescription(
          "Block messages containing a certain amount of mentions."
        )
        .addIntegerOption((opt) =>
          opt
            .setName("number")
            .setDescription(
              "The amount of mentions required to block a message."
            )
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel to send the alerts to.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("duration")
            .setDescription("The duration of the mute.")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("keyword")
        .setDescription("Block a certain keyword.")
        .addStringOption((opt) =>
          opt
            .setName("keyword")
            .setDescription("The keyword to block.")
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel to send the alerts to.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { guild, options } = interaction;
    const sub = options.getSubcommand();

    switch (sub) {
      case "flagged-words":
        await interaction.reply({
          content: `<a:loading:1107120114932924519> | Loading...`,
        });
        const channel = options.getChannel("channel");

        const rule = await guild.autoModerationRules
          .create({
            name: `Block profanity, sexual content, and slurs. (Doubt)`,
            creatorId: config.client.id,
            enabled: true,
            eventType: 1,
            triggerType: 4,
            triggerMetadata: {
              presets: [1, 2, 3],
            },
            actions: [
              {
                type: 1,
                metadata: {
                  customMessage:
                    "This message was prevented by Doubt's automod system.",
                },
              },
              {
                type: 2,
                metadata: {
                  channel: channel,
                },
              },
            ],
          })
          .catch(async (err) => {
            log(err, "err");
            await interaction.editReply({ content: `${err}` });
          });

        if (!rule) return;

        const embed = new EmbedBuilder()
          .setTitle(`Automod`)
          .setDescription(
            `:white_check_mark: | Successfully enabled the automod system.`
          )
          .setColor("Green")
          .setTimestamp();

        await interaction.editReply({ content: ``, embeds: [embed] });
        break;

      case "keyword":
        await interaction.reply({
          content: `<a:loading:1107120114932924519> | Loading...`,
        });
        const word = options.getString("keyword");
        const channel2 = options.getChannel("channel");
        const duration2 = options.getInteger("duration");

        const rule2 = await guild.autoModerationRules
          .create({
            name: `Prevents ${word} from being used. (Doubt)`,
            creatorId: config.client.id,
            enabled: true,
            eventType: 1,
            triggerType: 1,
            triggerMetadata: {
              keywordFilter: [`${word}`],
            },
            actions: [
              {
                type: 1,
                metadata: {
                  customMessage:
                    "This message was prevented by Doubt's automod system.",
                },
              },
              {
                type: 2,
                metadata: {
                  channel: channel2,
                },
              },
              {
                type: 3,
                metadata: {
                  durationSeconds: duration2,
                },
              },
            ],
          })
          .catch(async (err) => {
            log(err, "err");
            await interaction.editReply({ content: `${err}` });
          });

        if (!rule2) return;

        const embed2 = new EmbedBuilder()
          .setTitle(`Automod`)
          .setDescription(
            `:white_check_mark: | Successfully enabled the automod system.`
          )
          .addFields({
            name: "Blocked Word",
            value: `${word}`,
          })
          .setColor("Green")
          .setTimestamp();

        await interaction.editReply({ content: ``, embeds: [embed2] });
        break;

      case "spam-messages":
        await interaction.reply({
          content: `<a:loading:1107120114932924519> | Loading...`,
        });
        const channel3 = options.getChannel("channel");

        const rule3 = await guild.autoModerationRules
          .create({
            name: `Prevent spam messages. (Doubt)`,
            creatorId: config.client.id,
            enabled: true,
            eventType: 1,
            triggerType: 3,
            triggerMetadata: {},
            actions: [
              {
                type: 1,
                metadata: {
                  customMessage:
                    "This message was prevented by Doubt's automod system.",
                },
              },
              {
                type: 2,
                metadata: {
                  channel: channel3,
                },
              },
            ],
          })
          .catch(async (err) => {
            log(err, "err");
            await interaction.editReply({ content: `${err}` });
          });

        if (!rule3) return;

        const embed3 = new EmbedBuilder()
          .setTitle(`Automod`)
          .setDescription(
            `:white_check_mark: | Successfully enabled the automod system.`
          )
          .setColor("Green")
          .setTimestamp();

        await interaction.editReply({ content: ``, embeds: [embed3] });
        break;

      case "mention-spam":
        await interaction.reply({
          content: `<a:loading:1107120114932924519> | Loading...`,
        });
        const number = options.getInteger("number");
        const channel4 = options.getChannel("channel");
        const duration4 = options.getInteger("duration");

        const rule4 = await guild.autoModerationRules
          .create({
            name: `Prevent spam mentions. (Doubt)`,
            creatorId: config.client.id,
            enabled: true,
            eventType: 1,
            triggerType: 5,
            triggerMetadata: {
              mentionTotalLimit: number,
            },
            actions: [
              {
                type: 1,
                metadata: {
                  customMessage:
                    "This message was prevented by Doubt's automod system.",
                },
              },
              {
                type: 2,
                metadata: {
                  channel: channel4,
                },
              },
              {
                type: 3,
                metadata: {
                  durationSeconds: duration4,
                },
              },
            ],
          })
          .catch(async (err) => {
            log(err, "err");
            await interaction.editReply({ content: `${err}` });
          });

        if (!rule4) return;

        const embed4 = new EmbedBuilder()
          .setTitle(`Automod`)
          .setDescription(
            `:white_check_mark: | Successfully enabled the automod system.`
          )
          .setColor("Green")
          .setTimestamp();

        await interaction.editReply({ content: ``, embeds: [embed4] });
        break;
    }
  },
};
