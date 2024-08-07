const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all the possible commands!")
    .toJSON(),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const emojis = {
      general: "📜",
      economy: "💵",
      management: "👑",
      moderation: "🛠️",
      tickets: "🎫",
      info: "📝",
      utility: "🔧",
      fun: "🎉",
    };

    const directories = [
      ...new Set(client.collection.interactioncommands.map((cmd) => cmd.dir)),
    ];

    const index = directories.indexOf("Developers");
    const index2 = directories.indexOf("Testing");

    if (index2 !== -1) {
      directories.splice(index2, 1);
    }
    if (index !== -1) {
      directories.splice(index, 1);
    }

    /**
     *
     * @param {String} str
     * @returns
     */
    const formatString = (str) => {
      return `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
    };

    const categories = directories.map((dir) => {
      const getCommands = client.collection.interactioncommands
        .filter((cmd) => cmd.dir === dir)
        .map((cmd) => {
          return {
            name: cmd.data.name,
            description:
              cmd.data.description ||
              "Probably message/user interaction command",
          };
        });
      return {
        directory: formatString(dir),
        commands: getCommands,
      };
    });

    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} days, ${hours} hours, ${minutes} minutes & ${seconds} seconds`;

    const embed = new EmbedBuilder()
      .setDescription(
        "Welcome to the Doubt help system.\nPlease select a category from the dropdown menu"
      )
      .setTimestamp()
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setColor("Blurple")
      .setAuthor({
        name: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setFields(
        {
          name: "Categories",
          value: `${categories.map((cmd) => {
            return `\`${cmd.directory}\``;
          })}`,
          inline: true,
        },
        {
          name: "Usage",
          value:
            "Use the dropdown menu to select a category and view the commands.",
          inline: true,
        },
        {
          name: "Version",
          value: `${client.collection.version}`,
          inline: true,
        },
        {
          name: "Commands",
          value: `${client.collection.interactioncommands.size}`,
          inline: true,
        },
        {
          name: "Guilds",
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "Uptime",
          value: `${uptime}`,
          inline: true,
        },
        {
          name: "Node.js Version",
          value: `${process.version}`,
          inline: true,
        }
      );

    const components = (state) => [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Invite")
          .setDisabled(state)
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=1497231392118&scope=bot`
          ),
        new ButtonBuilder()
          .setLabel("Support")
          .setStyle(ButtonStyle.Link)
          .setDisabled(state)
          .setURL(`https://discord.gg/h6Ybsjg6NG`)
      ),

      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Please select a category")
          .setDisabled(state)
          .addOptions(
            categories.map((cmd) => {
              return {
                label: cmd.directory,
                value: cmd.directory.toLowerCase(),
                description: `Commands from ${cmd.directory} category.`,
                emoji: emojis[cmd.directory.toLowerCase() || null],
              };
            })
          )
      ),
    ];

    const initialMessage = await interaction.reply({
      embeds: [embed],
      components: components(false),
    });
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @returns
     */
    const filter = (interaction) =>
      interaction.user.id === interaction.member.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.StringSelect,
    });
    collector.on("collect", async (interaction) => {
      const [directory] = interaction.values;
      const category = categories.find(
        (x) => x.directory.toLowerCase() === directory
      );

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`${formatString(directory)} Commands`)
        .setDescription(`A list of all ${directory} commands.`)
        .addFields(
          category.commands.map((cmd) => {
            return {
              name: `\`${cmd.name}\``,
              value: `${cmd.description}`,
              inline: true,
            };
          })
        );

      interaction.update({ embeds: [categoryEmbed] });
    });

    collector.on("end", async () => {
      initialMessage.edit({ components: components(true) });
    });
  },
};
