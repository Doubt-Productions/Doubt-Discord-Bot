const {
  StringSelectMenuInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const ticketSchema = require("../../schemas/ticketSchema");

module.exports = {
  customId: "ticketSSM",
  /**
   *
   * @param {ExtendedClient} client
   * @param {StringSelectMenuInteraction} interaction
   */
  run: async (client, interaction) => {
    const value = interaction.values[0];

    const goBackBtn = new ButtonBuilder()
      .setCustomId("ticketGoBackBtn")
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary);

    const goBackRow = new ActionRowBuilder().addComponents(goBackBtn);

    const embed = new EmbedBuilder()
      .setTitle("🎫 | Ticket System")
      .setTimestamp()
      .setColor("Blurple")
      .setFooter({ text: `©️ Doubt Productions | Ticket System | ${value}` });

    const ticketData = await ticketSchema.findOne({
      Guild: interaction.guild.id,
    });

    switch (value) {
      case "category":
        const ticketCSM = new ChannelSelectMenuBuilder()
          .setCustomId("ticketCSM")
          .setPlaceholder("Select a category")
          .setChannelTypes(ChannelType.GuildCategory)
          .setMinValues(1)
          .setMaxValues(1);

        const ticketRow = new ActionRowBuilder().addComponents(ticketCSM);

        embed.setDescription(
          "Please select a category where you want to create tickets!"
        );

        const reply = await interaction.update({
          embeds: [embed],
          components: [ticketRow, goBackRow],
          fetchReply: true,
        });

        const filter = (i) => i.customId === "ticketCSM";
        const collector = reply.createMessageComponentCollector({
          filter,
          time: 60000,
        });

        collector.on("collect", async (i) => {
          const category = i.values[0];
          const guild = i.guild;
          const channel = guild.channels.cache.get(category);

          if (!channel) {
            return i.reply({
              content: "Please select a valid category!",
              ephemeral: true,
            });
          }

          if (ticketData) {
            ticketData.Category = category;
            ticketData.save();
          } else {
            new ticketSchema({
              Guild: guild.id,
              Category: category,
            }).save();
          }

          await i.reply({
            content: "Category has been set!",
            ephemeral: true,
          });
        });

        break;
    }
  },
};
