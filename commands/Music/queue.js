const {
  EmbedBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const playlist = require("../../Systems/models/playlist");
const client = require("../../index");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Make your own custom playlists.")
    .setDefaultMemberPermissions(0)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new playlist.")
        .addStringOption((option) =>
          option
            .setName("playlist-name")
            .setDescription("Provide the name of the playlist.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("privacy")
            .setDescription("Select a privacy option.")
            .setRequired(true)
            .addChoices(
              { name: "public", value: "public" },
              { name: "private", value: "private" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Adds a song to the provided playlist.")
        .addStringOption((option) =>
          option
            .setName("playlist-id")
            .setDescription("Provide the playlist ID.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("song-name")
            .setDescription("Provide the name of the song.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a song from a playlist.")
        .addStringOption((option) =>
          option
            .setName("playlist-id")
            .setDescription("Provide the playlist ID.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("song-position")
            .setDescription(
              "Provide the Position of the song to be removed from the playlist."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a playlist.")
        .addStringOption((option) =>
          option
            .setName("playlist-id")
            .setDescription("Provide the playlist ID.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("View all your playlists.")
        .addStringOption((option) =>
          option
            .setName("options")
            .setDescription("Select a privacy option.")
            .setRequired(true)
            .addChoices(
              { name: "public", value: "public" },
              { name: "private", value: "private" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("Find info about a playlist.")
        .addStringOption((option) =>
          option
            .setName("playlist-id")
            .setDescription("Provide the playlist ID.")
            .setRequired(true)
        )
    ),
  category: "Music",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   * @returns
   */
  run: async (client, interaction, config) => {
    const { options, guild, user, member, channel } = interaction;

    switch (options.getSubcommand()) {
      case "create":
        {
          const name = options.getString("name").toLowerCase();

          let data = await playlist.findOne({ User: user.id });

          if (!data) {
            new playlist({
              Guild: guild.id,
              User: user.id,
              Name: name,
              Privacy: true,
            }).save();
          } else {
            if (data.Name.includes(name))
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(
                      `❌ - A playlist already exists with the name **${name.toUpperCase()}**. Please try a different name.`
                    ),
                ],
              });

            new playlist({
              Guild: guild.id,
              User: user.id,
              Name: name,
              Privacy: true,
            }).save();
          }

          interaction.reply({
            embeds: [
              new EmbedBuilder().setColor(`ff575e`).setDescription(
                `✅ - ${user} has created a new playlist with the name **${name.toUpperCase()}**.
                Use \`/queue list\` to see the playlist ID and \`/queue privacy\` to change the privacy mode.`
              ),
            ],
          });
        }
        break;
      case "privacy":
        {
          const queueID = options.getString("playlist-id");
          const choice = options.getString("options");

          const queueInfo = await playlist.findById(queueID).catch(() => {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - Please provide a valid Playlist ID.`),
              ],
              ephemeral: true,
            });
          });

          if (user.id !== queueInfo.User)
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(
                    `❌ - You cannot manage a playlist from someone else.`
                  ),
              ],
              ephemeral: true,
            });

          switch (choice) {
            case "public":
              {
                if (queueInfo.Privacy === false)
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(`ff575e`)
                        .setDescription(
                          `❌ - This playlist is already set to \`Public\`.`
                        ),
                    ],
                    ephemeral: true,
                  });

                queueInfo.Privacy = false;
                await queueInfo.save();

                interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(`ff575e`)
                      .setDescription(
                        `🔓 - Playlist privacy is set to \`Public\`.`
                      ),
                  ],
                  ephemeral: true,
                });
              }
              break;
            case "private": {
              if (queueInfo.Privacy === true)
                return interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(`ff575e`)
                      .setDescription(
                        `❌ - This playlist is already set to \`Private\`.`
                      ),
                  ],
                  ephemeral: true,
                });

              queueInfo.Privacy = true;
              await queueInfo.save();

              interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(
                      `🔒 - Playlist privacy is set to \`Private\`.`
                    ),
                ],
                ephemeral: true,
              });
            }
          }
        }
        break;
      case "list":
        {
          const choice = options.getString("options");

          switch (choice) {
            case "public":
              {
                const queueList = await playlist.find({ Privacy: false });

                if (!queueList?.length)
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(`ff575e`)
                        .setDescription(
                          `❌ - There's no public playlists available right now. Please try again later.`
                        ),
                    ],
                  });

                let index = 1;

                const queueData = queueList.map((queue) => {
                  return [
                    `**${index++}. ${queue.Name.toUpperCase()}** - \`${
                      queue._id
                    }\``,
                  ].join("\n");
                });

                interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(`ff575e`)
                      .setTitle("📰 Public Playlists")
                      .setDescription(`${queueData}`)
                      .setThumbnail(guild.iconURL({ dynamic: true }))
                      .setFooter({
                        text: `Requested by ${user.tag}`,
                        iconURL: user.displayAvatarURL({ dynamic: true }),
                      })
                      .setTimestamp(),
                  ],
                });
              }
              break;
            case "private":
              {
                const queueList = await playlist.find({
                  User: user.id,
                  Privacy: true,
                });

                if (!queueList?.length)
                  return interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(`ff575e`)
                        .setDescription(
                          `❌ - There's no public playlists available right now. Please try again later.`
                        ),
                    ],
                  });

                let index = 1;

                const queueData = queueList.map((queue) => {
                  return [
                    `**${index++}. ${queue.Name.toUpperCase()}** - \`${
                      queue._id
                    }\``,
                  ].join("\n");
                });

                interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(`ff575e`)
                      .setTitle("📰 Your Playlists")
                      .setDescription(`${queueData}`)
                      .setThumbnail(guild.iconURL({ dynamic: true }))
                      .setFooter({
                        text: `Requested by ${user.tag}`,
                        iconURL: user.displayAvatarURL({ dynamic: true }),
                      })
                      .setTimestamp(),
                  ],
                });
              }
              break;
          }
        }
        break;
      case "info":
        {
          const queueID = options.getString("playlist-id");
          const queueInfo = playlist.findById(queueID).catch(() => {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - Please provide a valid Playlist ID.`),
              ],
              ephemeral: true,
            });
          });

          const User = guild.members.cache.get(queueInfo.User);

          let privacy;

          if (queueInfo.Privacy === true) privacy = "Private";
          else privacy = "Public";

          const rawFields = queueInfo.Songs.NAME;

          let index = 1;

          const fields = rawFields
            .map((f) => {
              return `**${index++}.** ${f}`;
            })
            .join("\n");

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(`ff575e`)
                .setTitle(`📰 Playlist Info`)
                .setDescription(
                  `
                **Name:** ${queueInfo.Name}
                **ID:** ${queueInfo._id}
                **Creator:** ${User}
                **Privacy:** ${privacy}

                **Songs:** ${fields}`
                )
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setFooter({
                  text: `Requested by ${user.tag}`,
                  iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp(),
            ],
          });
        }
        break;
      case "add":
        {
          const queueID = options.getString("playlist-id");
          const songs = options.getString("song-name");

          const queueInfo = playlist.findById(queueID).catch(() => {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - Please provide a valid Playlist ID.`),
              ],
              ephemeral: true,
            });
          });

          if (user.id !== queueInfo.User)
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - You can't add songs to this playlist.`),
              ],
              ephemeral: true,
            });

          const data = await client.distube
            .search(songs, { limit: 1 })
            .catch((err) => {
              if (err)
                return interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(`ff575e`)
                      .setDescription(`❌ - Please provide a valid song name.`),
                  ],
                  ephemeral: true,
                });
            });

          const URL = data[0].url;
          const NAME = data[0].name;

          if (queueInfo.Songs.URL.includes(URL))
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - This song is already in the playlist.`),
              ],
              ephemeral: true,
            });

          queueInfo.Songs.URL.push(URL);
          queueInfo.Songs.NAME.push(NAME);
          await queueInfo.save();

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(`Green`)
                .setDescription(`✅ - Added **${NAME}** to the playlist.`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setFooter({
                  text: `Requested by ${user.tag}`,
                  iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp(),
            ],
          });
        }
        break;
      case "remove":
        {
          const queueID = options.getString("playlist-id");
          const position = options.getInteger("song-position");

          const queueInfo = playlist.findById(queueID).catch(() => {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - Please provide a valid Playlist ID.`),
              ],
              ephemeral: true,
            });
          });

          if (user.id !== queueInfo.User)
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - You can't add songs to this playlist.`),
              ],
              ephemeral: true,
            });

          const Name = queueInfo.Songs.NAME;
          const Url = queueInfo.Songs.URL;

          const filtered = parseInt(position - 1);

          if (filtered > Name.length)
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(`❌ - Please provide a valid song position.`),
              ],
              ephemeral: true,
            });

          const afName = Name.splice(filtered, 1);
          const afUrl = Url.splice(filtered, 1);

          const rmName = afName.filter((x) => !Name.includes(x));
          const rmUrl = afUrl.filter((x) => !Url.includes(x));

          await queueInfo.save();

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(`Green`)
                .setDescription(
                  `✅ - Removed **[${rmName}](${rmUrl}** from the playlist.`
                )
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setFooter({
                  text: `Requested by ${user.tag}`,
                  iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp(),
            ],
          });
        }
        break;
      case "delete":
        {
        }
        break;
      case "play":
        {
        }
        break;
    }
  },
};
