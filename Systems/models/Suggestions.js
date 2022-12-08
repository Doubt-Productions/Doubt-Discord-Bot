const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestChannels",
  new Schema({
    Guild: String,
    Channel: String,
  })
);
