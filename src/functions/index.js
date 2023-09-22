const chalk = require("chalk");
const {
  EmbedBuilder,
  Colors,
  ChatInputCommandInteraction,
  ChannelType,
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

module.exports = {
  log,
  time,
  embed,
};
