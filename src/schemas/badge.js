const { Schema, model } = require("mongoose");

const Badge = new Schema({
  id: String,
  name: String,
  emoji: String,
  animated: Boolean,
  emojiId: String,
  createdAt: String,
});

module.exports = model("badge", Badge);
