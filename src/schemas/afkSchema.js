const { model, Schema } = require("mongoose");

module.exports = model(
  "afkS",
  new Schema({
    User: String,
    Guild: String,
    Message: String,
    Nickname: String,
  })
);
