const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const afkSchema = require("../../../schemas/afkSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Go afk inside of your server!")
    .addSubcommand((sub) =>
      sub
        .setName(`set`)
        .setDescription(`Go afk!`)
        .addStringOption((option) =>
          option
            .setName(`message`)
            .setDescription(`The reason you are going afk!`)
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub.setName(`remove`).setDescription(`Remove your afk status!`)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   * @param {[]} args
   */
  run: async (client, interaction, args) => {
    const { options } = interaction;

    const sub = options.getSubcommand();

    const Data = await afkSchema.findOne({
      Guild: interaction.guild.id,
      User: interaction.member.id,
    });

    switch (sub) {
      case "set":
        if (Data) return interaction.reply({ content: `You are already afk!` });

        const message = options.getString(`message`) || "No reason provided.";
        const nickname =
          interaction.member.displayName || interaction.member.nickname;

        await afkSchema.create({
          Guild: interaction.guild.id,
          User: interaction.member.id,
          Message: message,
          Nickname: nickname,
        });

        const name = `[AFK] ${nickname}`;

        await interaction.member.setNickname(`${name}`).catch((err) => {
          return;
        });

        const embed = new EmbedBuilder()
          .setTitle(`👋 You are now afk!`)
          .setDescription(
            `You have been set to afk with the reason of: ${message}`
          )
          .setColor(`Blurple`)
          .setTimestamp();

        const reply = await interaction.reply({ embeds: [embed] });
        setTimeout(() => {
          reply.delete();
        }, 4000);
        break;

      case "remove":
        if (!Data) {
          await interaction.reply({
            content: `You are not afk!`,
            ephemeral: true,
          });
        }

        const nick = Data.Nickname;
        await afkSchema.deleteMany({
          Guild: interaction.guild.id,
          User: interaction.member.id,
        });

        await interaction.member.setNickname(`${nick}`).catch((err) => {
          return;
        });

        const embed2 = new EmbedBuilder()
          .setTitle(`👋 You are no longer afk!`)
          .setDescription(`You have been removed from afk! Welcome back!`)
          .setColor(`Blurple`)
          .setTimestamp();

        const reply2 = await interaction.reply({ embeds: [embed2] });
        setTimeout(() => {
          reply2.delete();
        }, 4000);
        break;
    }
  },
};
