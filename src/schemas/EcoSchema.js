const { model, Schema } = require("mongoose");

let EcoSchema = new Schema({
  Guild: String,
  User: String,
  Bank: Number,
  Wallet: Number,
});

module.exports = model("EcoSchema", EcoSchema);
