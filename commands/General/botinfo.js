const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ChatInputCommandInteraction,
  UserFlags,
  version,
} = require("discord.js");
const buttonPages = require("../../Systems/Functions/pagination");
const client = require("../../index");
const config = require("../../config/config.json");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Advanced status command for the bot"),
  category: "",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    const { guild, member, user } = interaction;

    const status = ["Disconnected", "Connected", "Connecting", "Disconnecting"];

    await client.user.fetch();
    await client.application.fetch();

    const getChannelTypesize = (type) =>
      client.channels.cache.filter((channel) => type.includes(channel.type))
        .size;

    const embed1 = new EmbedBuilder()
      .setTitle(`${client.user.username} Status`)
      .setColor("DarkAqua")
      .setDescription(client.application.description || "No description")
      .addFields(
        { name: "Client", value: `${client.user.tag}`, inline: true },
        {
          name: "Created:",
          value: `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Verified",
          value: client.user.flags * UserFlags.VerifiedBot ? "Yes" : "No",
          inline: true,
        },
        {
          name: "Owner",
          value: `${client.application.owner.tag}`,
          inline: true,
        },
        {
          name: "Database",
          value: `${status[connection.readyState]}`,
          inline: true,
        },
        {
          name: "Uptime",
          value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Node.js",
          value: `${process.version}`,
          inline: true,
        },
        {
          name: "Discord.js",
          value: `${version}`,
          inline: true,
        },
        {
          name: "Ping",
          value: `${client.ws.ping}ms`,
          inline: true,
        }
      );

    const embed2 = new EmbedBuilder()
      .setTitle(`${client.user.username} Resource Usage`)
      .setColor("DarkAqua")
      .setDescription(`The usage of all the different resources of the bot.`)
      .addFields(
        {
          name: "Memory Usage",
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )} MB`,
          inline: true,
        },
        {
          name: "CPU Usage",
          value: `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`,
          inline: true,
        },
        {
          name: "OS",
          value: `${os.platform()} ${os.release()}`,
          inline: true,
        },
        {
          name: "CPU",
          value: `${os.cpus()[0].model}`,
          inline: true,
        },
        {
          name: "CPU Cores",
          value: `${os.cpus().length}`,
          inline: true,
        },
        {
          name: "CPU Speed",
          value: `${os.cpus()[0].speed} MHz`,
          inline: true,
        },
        {
          name: "Total Memory",
          value: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
          inline: true,
        },
        {
          name: "Free Memory",
          value: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
          inline: true,
        },
        {
          name: "Used Memory",
          value: `${((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(
            2
          )} MB`,
          inline: true,
        },
        {
          name: "Memory Usage",
          value: `${(
            ((os.totalmem() - os.freemem()) / os.totalmem()) *
            100
          ).toFixed(2)}%`,
          inline: true,
        }
      );

    const embed3 = new EmbedBuilder()
      .setTitle(`${interaction.guild.name} Channels`)
      .setColor("DarkAqua")
      .setDescription(`The amount of channels in the server.`)
      .addFields(
        {
          name: "Text Channels",
          value: `${getChannelTypesize([
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
          ])}`,
          inline: true,
        },
        {
          name: "Voice Channels",
          value: `${getChannelTypesize([
            ChannelType.GuildVoice,
            ChannelType.GuildStageVoice,
          ])}`,
          inline: true,
        },
        {
          name: "Threads",
          value: `${getChannelTypesize([
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
          ])}`,
          inline: true,
        }
      );

    const pages = [embed1, embed2, embed3];

    buttonPages(interaction, pages);
  },
};
