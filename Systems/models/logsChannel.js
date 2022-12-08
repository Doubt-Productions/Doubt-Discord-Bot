const { model, Schema } = require("mongoose");

module.exports = model(
  "logger-channels",
  new Schema({
    Guild: String,
    Channel: String,
  })
);
