const {
  PermissionFlagsBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ticketSchema = require("../../Systems/models/tickets");
const client = require("../../index");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("add or remove a member from a ticket")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName("member")
        .setDescription("Add or remove a member from a ticket")
        .setRequired(true)
        .addChoices(
          { name: "Add", value: "add" },
          { name: "Remove", value: "remove" }
        )
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add or remove")
        .setRequired(true)
    ),
  category: "Tickets",
  /**
   *
   * @param {client} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {config} config
   */
  run: async (client, interaction, config) => {
    const { guildId, channel, options } = interaction;
    const { ReadMessageHistory, ViewChannel, SendMessages } =
      PermissionFlagsBits;

    const action = options.getString("member");
    const member = options.getUser("user");

    const embed = new EmbedBuilder();

    switch (action) {
      case add:
        {
          ticketSchema.findOne(
            {
              GuildId: guildId,
              ChannelId: channel.id,
            },
            async (err, data) => {
              if (err) throw new err();
              if (!data)
                return interaction.reply({
                  embeds: [
                    embed
                      .setColor("Red")
                      .setDescription(
                        `Something went wrong, please try again later`
                      ),
                  ],
                  ephemeral: true,
                });

              if (data.MemberID.includes(member.id))
                return interaction.reply({
                  embeds: [
                    embed
                      .setColor("Red")
                      .setDescription(
                        `Something went wrong, please try again later`
                      ),
                  ],
                  ephemeral: true,
                });

              data.MemberID.push(member.id);

              channel.permissionOverwrites.edit(member.id, {
                SendMessages: true,
                ReadMessageHistory: true,
                ViewChannel: true,
              });

              interaction.reply({
                embeds: [
                  embed
                    .setColor("Green")
                    .setDescription(`Added ${member.tag} to the ticket!`),
                ],
              });

              data.save();
            }
          );
        }
        break;

      case "remove":
        {
          ticketSchema.findOne(
            {
              GuildId: guildId,
              ChannelId: channel.id,
            },
            async (err, data) => {
              if (err) throw new err();
              if (!data)
                return interaction.reply({
                  embeds: [
                    embed
                      .setColor("Red")
                      .setDescription(
                        `Something went wrong, please try again later`
                      ),
                  ],
                  ephemeral: true,
                });

              if (!data.MemberID.includes(member.id))
                return interaction.reply({
                  embeds: [
                    embed
                      .setColor("Red")
                      .setDescription(
                        `Something went wrong, please try again later`
                      ),
                  ],
                  ephemeral: true,
                });

              data.MemberID.remove(member.id);

              channel.permissionOverwrites.edit(member.id, {
                SendMessages: false,
                ReadMessageHistory: false,
                ViewChannel: false,
              });

              interaction.reply({
                embeds: [
                  embed
                    .setColor("Green")
                    .setDescription(`Remove ${member.tag} from the ticket!`),
                ],
              });

              data.save();
            }
          );
        }
        break;
    }
  },
};
