const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const ecoSchema = require("../../../schemas/EcoSchema");

var timeout = [];
var victimLock = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Rob a persons money")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to rob")
        .setRequired(true)
    )
    .toJSON(),
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

    // Hold per-user lock before any await. Otherwise two concurrent /rob calls
    // can both pass the cooldown check, run overlapping saves, and corrupt balances.
    timeout.push(user.id);
    const releaseCooldown = () => {
      timeout = timeout.filter((id) => id !== user.id);
    };
    let releaseVictim = null;

    try {
      const target = options.getUser("user");
      if (target.id === user.id) {
        releaseCooldown();
        return await interaction.reply({
          content: `You can't rob yourself!`,
          ephemeral: true,
        });
      }

      if (victimLock.includes(target.id)) {
        releaseCooldown();
        return await interaction.reply({
          content: `Someone is already robbing this user!`,
          ephemeral: true,
        });
      }

      victimLock.push(target.id);
      releaseVictim = () => {
        victimLock = victimLock.filter((id) => id !== target.id);
      };

      let Data = await ecoSchema.findFirst({ where: { User: user.id, Guild: guild.id } });
      let TargetData = await ecoSchema.findFirst({
        where: { User: target.id, Guild: guild.id },
      });

      if (!Data) {
        releaseVictim();
        releaseCooldown();
        return await interaction.reply({
          content: `You don't have an account!`,
          ephemeral: true,
        });
      }

      if (!TargetData) {
        releaseVictim();
        releaseCooldown();
        return await interaction.reply({
          content: `The target doesn't have an account!`,
          ephemeral: true,
        });
      }

      if (Data.Wallet < 100) {
        releaseVictim();
        releaseCooldown();
        return await interaction.reply({
          content: `You need atleast $100 to rob someone!`,
          ephemeral: true,
        });
      }

      if (TargetData.Wallet < 100) {
        releaseVictim();
        releaseCooldown();
        return await interaction.reply({
          content: `The target needs atleast $100 to rob them!`,
          ephemeral: true,
        });
      }

      const chance = Math.floor(Math.random() * 100) + 1;
      const amount = Math.floor(Math.random() * TargetData.Wallet) + 1;

      if (chance <= 50) {
        Data.Wallet += amount;
        TargetData.Wallet -= amount;
        await ecoSchema.update({ where: { id: Data.id }, data: { Wallet: Data.Wallet } });
        await ecoSchema.update({ where: { id: TargetData.id }, data: { Wallet: TargetData.Wallet } });

        releaseVictim();
        setTimeout(() => {
          timeout = timeout.filter((id) => id !== user.id);
        }, 60000);

        return await interaction.reply({
          content: `You robbed $${amount} from ${target.username}!`,
          ephemeral: true,
        });
      } else {
        // EcoSchema does not enforce non-negative balances; cap penalty to robber's wallet.
        const penalty = Math.min(amount, Data.Wallet);
        Data.Wallet -= penalty;
        TargetData.Wallet += penalty;
        await ecoSchema.update({ where: { id: Data.id }, data: { Wallet: Data.Wallet } });
        await ecoSchema.update({ where: { id: TargetData.id }, data: { Wallet: TargetData.Wallet } });

        releaseVictim();
        setTimeout(() => {
          timeout = timeout.filter((id) => id !== user.id);
        }, 60000);

        return await interaction.reply({
          content: `You got caught and paid ${target.username} $${penalty}!`,
          ephemeral: true,
        });
      }
    } catch (err) {
      releaseCooldown();
      if (releaseVictim) releaseVictim();
      throw err;
    }
  },
};
