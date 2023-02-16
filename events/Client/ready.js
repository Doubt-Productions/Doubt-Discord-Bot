const client = require("../../index");
const User = require("../../Systems/models/UserModel");

module.exports = {
  name: "ready",
};

client.once("ready", async () => {
  console.log(
    "\n" + `[READY] ${client.user.tag} is up and ready to go.`.brightGreen
  );

  const users = await User.find();
  for (let user of users) {
    client.userSettings.set(user.UserID, user);
  }

  require("../../Systems/handlers/premium")(client);

  // Rotating Status
  const activities = [
    {
      name: "/help",
      type: 3,
      status: "online",
    },
    {
      name: "with my commands",
      type: 0,
      status: "online",
    },
    {
      name: "my code",
      type: 3,
      status: "online",
    },
  ];

  async function pickStatus() {
    const option = Math.floor(Math.random() * activities.length);

    try {
      client.user.setPresence({
        activities: [
          {
            name: activities[option].name,
            type: activities[option].type,
          },
        ],
        status: activities[option].status,
      });
    } catch (err) {
      console.log(err);
    }
  }

  setInterval(pickStatus, 8 * 1000);

  // Bot Users & Guilds:

  setTimeout(async () => {
    const botGuilds = client.guilds.cache.size;
    const botUsers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    console.log(botUsers);

    const guild = client.guilds.cache.get("833675115408523264");

    const userChannel = guild.channels.cache.get("1075813506655453377");
    const guildChannel = guild.channels.cache.get("1050535065232343060");

    await userChannel.edit({ name: `Bot Users: | ${botUsers}` });
    await guildChannel.edit({ name: `Bot Guilds: | ${botGuilds}` });
  }, 600000);
});
