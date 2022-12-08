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
});
