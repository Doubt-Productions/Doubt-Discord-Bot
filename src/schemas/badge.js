const { Schema, model } = require("mongoose");

const Badge = new Schema({
  id: String,
  name: String,
  emoji: String,
  createdAt: String,
  animated: Boolean,
});

module.exports = model("badge", Badge);
