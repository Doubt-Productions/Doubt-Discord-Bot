const {
  EmbedBuilder,
  ComponentType,
  ActionRowBuilder,
  SelectMenuBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const client = require("../../index");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with the bot."),
  category: "General",
  premium: false,
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} config
   */
  run: async (client, interaction, config) => {
    const emojis = {
      general: "📜",
      admin: "🔒",
      roles: "👑",
      music: "🎵",
      leveling: "📈",
      moderation: "🛠️",
      tickets: "🎫",
      suggestions: "📝",
      setup: "🛠️",
      fun: "🎉",
    };

    const directories = [...new Set(client.commands.map((cmd) => cmd.dir))];

    const index = directories.indexOf("Owner");

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
      const getCommands = client.commands
        .filter((cmd) => cmd.dir === dir)
        .map((cmd) => {
          return {
            name: cmd.data.name,
            description: cmd.data.description,
          };
        });
      return {
        directory: formatString(dir),
        commands: getCommands,
      };
    });

    const embed = new EmbedBuilder().setDescription(
      "Please choose a category in the dropdown menu."
    );

    const components = (state) => [
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
      componentType: ComponentType.SelectMenu,
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
