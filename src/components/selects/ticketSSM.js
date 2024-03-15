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

      case "channel":
        const ticketCSM2 = new ChannelSelectMenuBuilder()
          .setCustomId("ticketCSM2")
          .setPlaceholder("Select a channel")
          .setChannelTypes(ChannelType.GuildText)
          .setMinValues(1)
          .setMaxValues(1);

        const ticketRow2 = new ActionRowBuilder().addComponents(ticketCSM2);

        embed.setDescription(
          "Please select a channel where you want to create tickets!"
        );

        const reply2 = await interaction.update({
          embeds: [embed],
          components: [ticketRow2, goBackRow],
          fetchReply: true,
        });

        const filter2 = (i) => i.customId === "ticketCSM2";
        const collector2 = reply2.createMessageComponentCollector({
          filter: filter2,
          time: 60000,
        });

        collector2.on("collect", async (i) => {
          const channel = i.values[0];
          const guild = i.guild;
          const channel2 = guild.channels.cache.get(channel);

          if (!channel2) {
            return i.reply({
              content: "Please select a valid channel!",
              ephemeral: true,
            });
          }

          if (ticketData) {
            ticketData.Channel = channel;
            ticketData.save();
          } else {
            new ticketSchema({
              Guild: guild.id,
              Channel: channel,
            }).save();
          }

          await i.reply({
            content: "Channel has been set!",
            ephemeral: true,
          });
        });

        break;
    }
  },
};
