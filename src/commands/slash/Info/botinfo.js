const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { time } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("General information about the bot"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const name = client.user.username;
    const icon = `${client.user.displayAvatarURL({ forceStatic: false })}`;

    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} days, ${hours} hours, ${minutes} minutes & ${seconds} seconds`;

    let ping = `${Date.now() - interaction.createdTimestamp}ms`;
    let prefixcommands = client.collection.prefixcommands.size;
    let slashcommands = client.collection.interactioncommands.size;
    let totalcommands = prefixcommands + slashcommands;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Doubt")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/rmqAhQz2qu"),
      new ButtonBuilder()
        .setLabel("My Creator")
        .setStyle(ButtonStyle.Link)
        .setURL("https://links.zvapor.xyz/linktree")
    );

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({ name: name, iconURL: icon })
      .setThumbnail(icon)
      .setFooter({
        text: `Bot ID: ${client.user.id} | Bot Version: ${client.collection.version}`,
      })
      .addFields(
        {
          name: "Bot Name",
          value: `${name}`,
          inline: true,
        },
        {
          name: "Bot ID",
          value: `${client.user.id}`,
          inline: true,
        },
        {
          name: "Bot Version",
          value: `${client.collection.version}`,
          inline: true,
        },
        {
          name: "Bot Uptime",
          value: `\`\`\`${uptime}\`\`\``,
          inline: true,
        },
        {
          name: "Bot Ping",
          value: `${ping}`,
          inline: true,
        },
        {
          name: "Bot Created At",
          value: `${time(client.user.createdAt, "f")}`,
          inline: true,
        },
        {
          name: "Prefix Commands",
          value: `${prefixcommands} Commands`,
          inline: true,
        },
        {
          name: "Slash Commands",
          value: `${slashcommands} Commands`,
          inline: true,
        },
        {
          name: "Total Commands",
          value: `${prefixcommands + slashcommands} Commands`,
          inline: true,
        }
      );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
