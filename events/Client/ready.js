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
});
