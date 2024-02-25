const { model, Schema } = require("mongoose");

module.exports = model(
  "chatbot",
  new Schema({
    Guild: String,
    Channel: String,
  })
);
