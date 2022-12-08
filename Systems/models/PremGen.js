const { model, Schema } = require("mongoose");

module.exports = model(
  "premium-codes",
  new Schema({
    code: { type: String, required: true, default: null },
    expiresAt: { type: Number, default: null, required: true },
    plan: { type: String, required: true, default: null },
  })
);
