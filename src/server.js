function server() {
  const express = require("express");

  // Constants
  const PORT = 8080;
  const HOST = "0.0.0.0";

  // App
  const app = express();
  app.get("/", (req, res) => {
    res.send("Bot is online! Join our discord here: https://discord.gg/rmqAhQz2qu");
  });

  app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });
}

module.exports = server;
