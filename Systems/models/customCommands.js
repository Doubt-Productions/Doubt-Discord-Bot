const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  guildId: String,
  commandName: String,
  response: String,
});

module.exports = mongoose.model("custom-commands", Schema);
