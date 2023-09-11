const { Schema, model } = require("mongoose");

const XpSchema = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
});

module.exports = model("Xp", XpSchema);
