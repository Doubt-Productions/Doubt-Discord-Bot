const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");

const badges = require("../../../schemas/badge");
const users = require("../../../schemas/userConfig");
const { randomId } = require("../../../functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("badge")
    .setDescription("Adds a badge to your user profile")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a badge")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the badge")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("The emoji of the badge")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit a badge")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the badge")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the badge")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("The emoji of the badge")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a badge")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the badge")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Give a badge to a user")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the badge")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("user-id")
            .setDescription("The ID of the user")
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    if (!client.owners.includes(interaction.user.id))
      return interaction.reply({ content: `You are not a owner` });

    await interaction.deferReply();

    let option = interaction.options.getSubcommand(),
      id = interaction.options.getString("id"),
      name = interaction.options.getString("name"),
      emoji = interaction.options.getString("emoji")?.split(/ +/g)[0],
      user_id = interaction.options.getString("user-id"),
      user = client.users.cache.get(user_id),
      userData = user
        ? (await users.findOne({ user: user?.id })) ||
          (await users.create({ user: user?.id }))
        : null,
      badge = await badges.findOne({ id });

    if (option === "create") {
      if (!isEmoji(client, emoji))
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid Emoji",
              description: "Please provide a valid emoji",
            },
          ],
        });

      badge = await badges.create({
        id: randomId(8),
        name,
        emoji,
        createdAt: Date.now(),
      });

      interaction.editReply({
        embeds: [
          {
            title: "✅ Successfully created the badge!",
            fields: [
              {
                name: "Badge ID",
                value: badge.id,
                inline: true,
              },
              {
                name: "Badge Name",
                value: badge.name,
                inline: true,
              },
              {
                name: "Badge Emoji",
                value:
                  client.emojis.cache.get(badge.emoji) ||
                  badge.emoji ||
                  "Unknown",
                inline: true,
              },
              {
                name: "Created At",
                value: `<t:${badge.createdAt}>`,
                inline: true,
              },
            ],
          },
        ],
      });
    } else if (option === "edit") {
      if (!badge)
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid badge",
              description: "Please provide a valid badge ID",
            },
          ],
        });

      name = name || badge.name;
      emoji = emoji || badge.emoji;

      if (!isEmoji(client, emoji))
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid Emoji",
              description: "Please provide a valid emoji",
            },
          ],
        });

      badge = await badges.findOneAndUpdate(
        { id },
        {
          name,
          emoji,
          createdAt: Date.now(),
        },
        { new: true }
      );

      interaction.editReply({
        embeds: [
          {
            title: "✅ Successfully edited the badge!",
            fields: [
              {
                name: "Badge ID",
                value: badge.id,
                inline: true,
              },
              {
                name: "Badge Name",
                value: badge.name,
                inline: true,
              },
              {
                name: "Badge Emoji",
                value:
                  client.emojis.cache.get(badge.emoji) ||
                  badge.emoji ||
                  "Unknown",
                inline: true,
              },
              {
                name: "Created At",
                value: `<t:${badge.createdAt}>` || "Unknown Date",
                inline: true,
              },
            ],
          },
        ],
      });
    } else if (option === "delete") {
      if (!badge)
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid badge",
              description: "Please provide a valid badge ID",
            },
          ],
        });

      await badges.findOneAndDelete({ id });

      interaction.editReply({
        embeds: [
          {
            title: "✅ Badge Deleted",
          },
        ],
      });
    } else if (option === "give") {
      if (!badge)
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid badge",
              description: "Please provide a valid badge ID",
            },
          ],
        });

      if (!user)
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid User",
              description: "Please provide a valid user ID",
            },
          ],
        });

      if (userData?.badges?.includes(badge.id))
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Cannot Add Badge",
              description: "The provided user already have this badge!",
            },
          ],
        });

      await users.findOneAndUpdate(
        { user: user.id },
        { $push: { badges: badge.id } }
      );

      interaction.editReply({
        embeds: [
          {
            title: "✅ Badge Added",
            description: `Successfully gave **${badge.name}** to **${user.username}**`,
          },
        ],
      });
    } else if (option === "take") {
      if (!badge)
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid badge",
              description: "Please provide a valid badge ID",
            },
          ],
        });

      if (!user)
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Invalid User",
              description: "Please provide a valid user ID",
            },
          ],
        });

      if (!userData?.badges?.includes(badge.id))
        return interaction.editReply({
          embeds: [
            {
              title: "❌ Cannot Take Badge",
              description: "The provided user do not have this badge!",
            },
          ],
        });

      await users.findOneAndDelete(
        { user: user.id },
        { $pull: { badges: badge.id } }
      );

      interaction.editReply({
        embeds: [
          {
            title: "✅ Badge Removed",
            description: `Successfully took **${badge.name}** from **${user.username}**`,
          },
        ],
      });
    } else if (option === "list") {
      const badg = await badges.find();

      if (badg.length === 0)
        return interaction.editReply({
          embeds: [
            {
              title: "This bot does not have badges",
              color: "Red",
            },
          ],
        });

      let str = "";

      for (let i = 0; i < badg.length; i++) {
        const bg = badg[i];

        str += `${
          client.emojis.cache.get(bg?.emoji)?.toString() || bg?.emoji
        } **${bg?.name}** | Created At: <t:${bg.createdAt}>\n`;
      }

      interaction.editReply({
        embeds: [
          {
            title: "Badges Of The Bot",
            description: str,
          },
        ],
      });
    }
  },
};
