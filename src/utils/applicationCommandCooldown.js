/**
 * Per-user cooldown for application commands (slash / context), keyed by command name.
 * Shared across handlers so duplicate listeners do not maintain separate maps.
 */
const cooldown = new Map();

/**
 * @param {import("discord.js").CommandInteraction} interaction
 * @param {number} cooldownMs
 * @returns {Promise<boolean>} true if the command may run; false if still on cooldown (reply sent)
 */
async function enforceApplicationCommandCooldown(interaction, cooldownMs) {
  if (!cooldownMs || cooldownMs <= 0) return true;

  const userId = interaction.user.id;
  const commandName = interaction.commandName;

  const cooldownFunction = () => {
    let data = cooldown.get(userId) ?? [];
    data.push(commandName);
    cooldown.set(userId, data);

    setTimeout(() => {
      let d = cooldown.get(userId);
      if (!d) return;
      d = d.filter((v) => v !== commandName);
      if (d.length <= 0) {
        cooldown.delete(userId);
      } else {
        cooldown.set(userId, d);
      }
    }, cooldownMs);
  };

  if (cooldown.has(userId)) {
    const data = cooldown.get(userId);
    if (data.some((v) => v === commandName)) {
      await interaction.reply({
        content: "Slow down buddy! You're too fast to use this command.",
      });
      return false;
    }
    cooldownFunction();
  } else {
    cooldown.set(userId, []);
    cooldownFunction();
  }

  return true;
}

module.exports = { enforceApplicationCommandCooldown };
