const { model, Schema } = require("mongoose");

module.exports = model(
  "ticket-setups",
  new Schema({
    GuildID: String,
    Channel: String,
    Category: String,
    Transcripts: String,
    Handlers: String,
    Description: String,
    Buttons: [String],
  })
);
