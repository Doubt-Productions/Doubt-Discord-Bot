const {
  EmbedBuilder,
  ChannelType,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("View information about the server!"),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const guild = interaction.guild;
    const embeds = [];
    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString());
    const members = guild.members.cache;
    const channels = guild.channels.cache;
    const emojis = guild.emojis.cache;

    const embed1fields = [
      `\n**Name:** ${guild.name}`,
      `\n**ID:** ${guild.id}`,
      `\n**Owner:** ${(await guild.fetchOwner()).user.displayName} (${
        (await guild.fetchOwner()).id
      })`,
      `\n**Features:** ${guild.features.length ? guild.features.join(", ") : "None"}`,
      `\n**Boost Tier:** ${
        guild.premiumTier ? `Tier ${guild.premiumTier}` : "None"
      }`,
      `\n**Explicit Filter:** ${guild.explicitContentFilter}`,
      `\n**Verification Level:** ${guild.verificationLevel}`,
      `\n**Created At:** ${guild.createdAt.toLocaleString()}`,
    ];
    const embeds2fields = [
      `\n**Role Count:** ${roles.length}`,
      `\n**Emoji Count:** ${emojis.size}`,
      `\n**Regular Emoji Count:** ${
        emojis.filter((emoji) => !emoji.animated).size
      }`,
      `\n**Animated Emoji Count:** ${
        emojis.filter((emoji) => emoji.animated).size
      }`,
      `\n**Member Count:** ${guild.memberCount}`,
      `\n**Humans:** ${members.filter((member) => !member.user.bot).size}`,
      `\n**Bots:** ${members.filter((member) => member.user.bot).size}`,
      `\n**Text Channels:** ${
        channels.filter((channel) => channel.type === "GUILD_TEXT").size
      }`,
      `\n**Voice Channels:** ${
        channels.filter((channel) => channel.type === "GUILD_VOICE").size
      }`,
      `\n**Boost Count:** ${guild.premiumSubscriptionCount || "0"}`,
    ];

    const embed3fields = [
      `\n**Category Channels:** ${
        channels.filter((channel) => channel.type === ChannelType.GuildCategory)
          .size
      }`,
      `\n**Text Channels:** ${
        channels.filter((channel) => channel.type === ChannelType.GuildText)
          .size
      }`,
      `\n**Voice Channels:** ${
        channels.filter((channel) => channel.type === ChannelType.GuildVoice)
          .size
      }`,
      `\n**Announcement Channels:** ${
        channels.filter(
          (channel) => channel.type === ChannelType.GuildAnnouncement
        ).size
      }`,
      `\n**Stage Channels:** ${
        channels.filter(
          (channel) => channel.type === ChannelType.GuildStageVoice
        ).size
      }`,
    ];

    // Create first page
    const embed1 = new EmbedBuilder()
      .setTitle(`Server Info - ${guild.name}`)
      .setColor("Blurple")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields({
        name: "General",
        value: `${embed1fields}`,
      })
      .addFields({
        name: "Statistics",
        value: `${embeds2fields}`,
      })
      .setFooter({ text: `Page 1 of 3` });

    embeds.push(embed1);

    // Create second page
    const embed2 = new EmbedBuilder()
      .setTitle(`Server Info - ${guild.name}`)
      .setColor("Blurple")
      .addFields({
        name: `Roles (${roles.length})`,
        value: `${roles.length ? roles.join(", ") : "None"}`,
      })
      .setFooter({ text: `Page 2 of 3` });

    embeds.push(embed2);

    // Create third page
    const embed3 = new EmbedBuilder()
      .setTitle(`Server Info - ${guild.name}`)
      .setColor("Blurple")
      .addFields({
        name: "Channels",
        value: `${embed3fields}`,
      })
      .setFooter({ text: `Page 3 of 3` });

    embeds.push(embed3);

    // Send the first page
    const message = await interaction.reply({
      embeds: [embed1],
      fetchReply: true,
    });

    // Add reactions
    await message.react("⬅️");
    await message.react("➡️");

    let currentPage = 0;
    const filter = (reaction, user) =>
      ["⬅️", "➡️"].includes(reaction.emoji.name) &&
      user.id === interaction.user.id;
    const collector = message.createReactionCollector({ filter, time: 60000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️" && currentPage < embeds.length - 1) {
          currentPage++;
          await message.edit({ embeds: [embeds[currentPage]] });
        } else if (reaction.emoji.name === "⬅️" && currentPage !== 0) {
          currentPage--;
          await message.edit({ embeds: [embeds[currentPage]] });
        }
        await reaction.users.remove(user.id);
      } catch (error) {
        console.error(error);
      }
    });

    collector.on("end", () => {
      message.reactions.removeAll();
    });
  },
};
