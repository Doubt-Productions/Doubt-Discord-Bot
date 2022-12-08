const Levels = require("discord-xp");
const client = require("../../index");
const config = require("../../config/config.json");
const DB = require("../../Systems/models/leveling");
Levels.setURL(config.Handlers.MONGO);

module.exports = {
  name: "leveling",
};

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  let data = DB.findOne({ Guild: message.guild.id }).catch((err) => {});
  if (data.Enabled === false) return;

  const randomXp = Math.floor(Math.random() * 29) + 1;
  const hasLeveledUp = await Levels.appendXp(
    message.author.id,
    message.guild.id,
    randomXp
  );
  if (hasLeveledUp) {
    const user = await Levels.fetch(message.author.id, message.guild.id);
    message.reply(
      `${message.author}, You have leveled up to ${user.level}! Keep it going!`
    );
  }
});
