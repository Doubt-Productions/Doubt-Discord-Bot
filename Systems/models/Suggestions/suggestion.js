const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestions",
  new Schema({
    message: String,
    token: String,
    suggestion: String,
    user: String,
    guild: String,
  })
);
