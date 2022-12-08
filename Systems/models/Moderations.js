const { model, Schema } = require("mongoose");

module.exports = model(
  "moderations",
  new Schema({
    GuildID: String,
    UserID: String,
    UserTag: String,
    Content: Array,
  })
);
