const chalk = require("chalk");
const {
  EmbedBuilder,
  Colors,
  ChatInputCommandInteraction,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

/**
 *
 * @param {string} string
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style
 */
const log = (string, style) => {
  switch (style) {
    case "info": {
      console.log(chalk.blue("[INFO] " + string));

      break;
    }

    case "err": {
      console.error(chalk.red("[ERROR] " + string));

      break;
    }

    case "warn": {
      console.warn(chalk.yellow("[WARNING] " + string));

      break;
    }

    case "done": {
      console.log(chalk.green("[SUCCESS] " + string));

      break;
    }

    default: {
      console.log(string);

      break;
    }
  }
};
/**
 *
 * @param {*} title
 * @param {*} description
 * @param {*} color
 * @param {import("discord.js").GuildChannel} channel
 * @param {ChatInputCommandInteraction} interaction
 */
const embed = (
  title,
  description,
  color,
  footer,
  image,
  thumbnail,
  channel,
  interaction
) => {
  if (channel) {
    const channeltoSend = interaction.guild.channels.cache.get(channel.id);

    return channeltoSend.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(Colors[color])
          .setFooter({ text: footer })
          .setImage(image)
          .setThumbnail(thumbnail),
      ],
    });
  } else if (!channel) {
    return interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(Colors[color])
          .setFooter({ text: footer })
          .setImage(image)
          .setThumbnail(thumbnail),
      ],
    });
  }
};

/**
 *
 * @param {number} time
 * @param {import('discord.js').TimestampStylesString} style
 * @returns {`<t:${string}>`}
 */
const time = (time, style) => {
  return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ""}>`;
};

const randomId = (length = 12) => {
  const STRING = "QWERTYUIOPASDFGHJKLZXCVBNM",
    STRING2 = STRING.toLowerCase(),
    NUMBER = "1234567890",
    chars = STRING + STRING2 + NUMBER;

  let pass = "";

  while (pass.length < length)
    pass += chars[Math.floor(Math.random() * chars.length)];

  return pass;
};

const buttonPagination = async (interaction, pages, time = 30 * 1000) => {
  try {
    if (!interaction || !pages || !pages.length > 0)
      throw new Error("Invalid arguments");

    await interaction.deferReply();

    if (pages.length === 1) {
      return await interaction.editReply({
        embeds: pages,
        components: [],
        fetchReply: true,
      });
    }

    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const home = new ButtonBuilder()
      .setCustomId("home")
      .setEmoji("🏠")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder().addComponents([prev, home, next]);
    let index = 0;

    const msg = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttons],
      fetchReply: true,
    });

    const mc = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    mc.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({
          content: "You are not allowed to do this!",
          ephemeral: true,
        });

      await i.deferUpdate({});

      if (i.customId === "prev") {
        if (index > 0) index--;
      } else if (i.customId === "home") {
        index = 0;
      } else if (i.customId === "next") {
        if (index < pages.length - 1) index++;
      }

      if (index === 0) {
        prev.setDisabled(true);
        home.setDisabled(true);
      } else {
        prev.setDisabled(false);
        home.setDisabled(false);
      }

      if (index === pages.length - 1) {
        next.setDisabled(true);
      } else {
        next.setDisabled(false);
      }

      await msg.edit({
        embeds: [pages[index]],
        components: [buttons],
      });

      mc.resetTimer();

      mc.on("end", async () => {
        await msg.edit({
          embeds: [pages[index]],
          components: [],
        });
      });

      return msg;
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  log,
  time,
  embed,
  randomId,
  buttonPagination,
};
