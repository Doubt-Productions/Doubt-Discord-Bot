const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.json");
const suggestSchema = require("../../Systems/models/Suggestions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Suggest something for the server.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your suggestion")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of your suggestion")
        .setRequired(true)
    ),

  category: "General",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    const { guild, member, options } = interaction;

    const name = options.getString("name");
    const description = options.getString("description");

    const errorEmbed = new EmbedBuilder();

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`A suggestion made by ${member}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "Name",
          value: name,
        },
        {
          name: "Description",
          value: description,
        }
      )
      .setFooter({
        text: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      });

    suggestSchema.findOne({ Guild: guild.id }, async (err, data) => {
      if (err) throw new err();
      if (!data) {
        return interaction.reply(
          errorEmbed
            .setColor(`Red`)
            .setTitle(`No setup found!`)
            .setDescription(
              `Please visit the [dashboard](https://dashboard.zvapor.xyz) to set up the suggestion channel.`
            )
        );
      } else {
        const Channel = guild.channels.cache.get(data.Channel);
        Channel.send({ embeds: [embed] }).then((msg) => {
          interaction.reply({
            content: `Your suggestion has been sent!`,
            ephemeral: true,
          });
        });
      }
    });
  },
};
