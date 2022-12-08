const { model, Schema } = require("mongoose");

module.exports = model(
  "users",
  new Schema({
    UserID: { type: String, unique: true },
    isPremium: { type: Boolean, default: false },
    premium: {
      redeemedBy: { type: Array, default: null },
      RedeemedAt: { type: Number, default: null },
      expiresAt: { type: Number, default: null },
      plan: { type: String, default: null },
    },
  })
);
