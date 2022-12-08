const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { VoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Manage the music system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Plays a song.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Provide the song name or URL")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("settings")
        .setDescription("Manage the music system.")
        .addStringOption((option) =>
          option
            .setName("options")
            .setDescription("Select an option to continue")
            .setRequired(true)
            .addChoices(
              { name: "⏭️ Skip Song", value: "skip" },
              { name: "⏹️ Stop Song", value: "stop" },
              { name: "⏯️ Pause Song", value: "pause" },
              { name: "▶️ Resume Song", value: "resume" },
              { name: "🔁 Loop Song", value: "loop" },
              { name: "🔀 Shuffle Songs", value: "shuffle" },
              { name: "🔢 View Queue", value: "queue" },
              { name: "🔁 Toggle autoplay modes", value: "autoplay" },
              { name: "♉ Add a related song", value: "relatedsong" },
              { name: "🔂 Toggle repeat mode", value: "repeatmode" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("volume")
        .setDescription("Change the volume of the player. (1-100%)")
        .addIntegerOption((option) =>
          option
            .setName("percentage")
            .setDescription("Provide the volume percentage for the player.")
            .setRequired(true)
        )
    ),
  inVoiceChannel: true,
  category: "Music",
  /**
   *
   * @param {client} client
   * @param {CommandInteraction} interaction
   * @returns
   */
  run: async (client, interaction, config, db) => {
    const { options, guild, member, channel } = interaction;

    const VoiceChannel = member.voice.channel;
    if (!VoiceChannel)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(`ff575e`)
            .setDescription(
              `!! - You must be in a voice channel to use this command.`
            ),
        ],
        ephemeral: true,
      });

    try {
      switch (options.getSubcommand()) {
        case "play": {
          client.DisTube.play(VoiceChannel, options.getString("query"), {
            textChannel: channel,
            member,
          });

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("ff575e")
                .setDescription(`🎶 - Request Recieved`),
            ],
          });
        }

        case "volume": {
          const Volume = options.getInteger("percentage");

          if (Volume > 100 || Volume < 1)
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(
                    `!! - The volume value must be greater than 0 and less than 100.`
                  ),
              ],
              ephemeral: true,
            });

          client.DisTube.setVolume(VoiceChannel, Volume);

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(`ff575e`)
                .setDescription(`🔊 - Volume is now set to **${Volume}**`),
            ],
          });
        }

        case "settings": {
          const queue = await client.DisTube.getQueue(VoiceChannel);
          if (!queue)
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(`ff575e`)
                  .setDescription(
                    `!! - There's no active queue. Please add some songs and try again.`
                  ),
              ],
              ephemeral: true,
            });

          switch (options.getString("options")) {
            case "skip": {
              await queue.skip(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(`⏭️ - Skipped the current song.`),
                ],
              });
            }

            case "stop": {
              queue.stop(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(`⏹️ - Stopped the player.`),
                ],
              });
            }

            case "pause": {
              await queue.pause(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(`⏸️ - Paused the current song.`),
                ],
              });
            }

            case "resume": {
              await queue.resume(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(`▶️ - Resumed the current song.`),
                ],
              });
            }

            case "shuffle": {
              await queue.shuffle(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(`🔀 - Shuffled the queue.`),
                ],
              });
            }

            case "autoplay": {
              let Mode = await queue.toggleAutoplay(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(
                      `🔁 - Autoplay mode is set to **${Mode ? "On" : "Off"}**.`
                    ),
                ],
              });
            }

            case "relatedsong": {
              await queue.addRelatedSong(VoiceChannel);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(`♉ - Added a related song to the queue.`),
                ],
              });
            }

            case "repeatmode": {
              let Mode = await client.DisTube.setRepeatMode(queue);

              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setDescription(
                      `🔂 - Repead mode is set to **${(Mode = Mode
                        ? Mode == 2
                          ? "Queue"
                          : "Song"
                        : "Off")}**`
                    ),
                ],
              });
            }

            case "queue": {
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(`ff575e`)
                    .setTitle(`Queue of ${interaction.guild.name}`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setDescription(
                      `${queue.songs.map(
                        (song, id) =>
                          `\n\`${id + 1}\`. ${song.name} - \`${
                            song.formattedDuration
                          }\``
                      )}`
                    )
                    .setFooter({
                      text: `Requested by ${interaction.user.tag}`,
                      iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp(),
                ],
              });
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      return interaction.reply(`❌ An error occured. Please try again.`);
    }
  },
};
