const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

var timeout = [];

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Rob a persons money")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to rob")
        .setRequired(true)
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { user, guild, options } = interaction;

    if (timeout.includes(user.id))
      return await interaction.reply({
        content: `You are on a cooldown!`,
        ephemeral: true,
      });

    const target = options.getUser("user");
    if (target.id === user.id)
      return await interaction.reply({
        content: `You can't rob yourself!`,
        ephemeral: true,
      });

    let Data = await ecoSchema.findOne({ User: user.id, Guild: guild.id });
    let TargetData = await ecoSchema.findOne({
      User: target.id,
      Guild: guild.id,
    });

    if (!Data)
      return await interaction.reply({
        content: `You don't have an account!`,
        ephemeral: true,
      });

    if (!TargetData)
      return await interaction.reply({
        content: `The target doesn't have an account!`,
        ephemeral: true,
      });

    if (Data.Wallet < 100)
      return await interaction.reply({
        content: `You need atleast $100 to rob someone!`,
        ephemeral: true,
      });

    if (TargetData.Wallet < 100)
      return await interaction.reply({
        content: `The target needs atleast $100 to rob them!`,
        ephemeral: true,
      });

    const chance = Math.floor(Math.random() * 100) + 1;
    const amount = Math.floor(Math.random() * TargetData.Wallet) + 1;

    if (chance <= 50) {
      Data.Wallet += amount;
      TargetData.Wallet -= amount;
      await Data.save();
      await TargetData.save();

      timeout.push(user.id);
      setTimeout(() => {
        timeout = timeout.filter((id) => id !== user.id);
      }, 60000);

      return await interaction.reply({
        content: `You robbed $${amount} from ${target.username}!`,
        ephemeral: true,
      });
    } else {
      Data.Wallet -= amount;
      TargetData.Wallet += amount;
      await Data.save();
      await TargetData.save();

      timeout.push(user.id);
      setTimeout(() => {
        timeout = timeout.filter((id) => id !== user.id);
      }, 60000);

      return await interaction.reply({
        content: `You got caught and paid ${target.username} $${amount}!`,
        ephemeral: true,
      });
    }
  },
};
