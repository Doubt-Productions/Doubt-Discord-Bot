const { model, Schema } = require("mongoose");

module.exports = model(
  "welcome",
  new Schema({
    Guild: String,
    Channel: String,
    Message: String,
    Rules: String,
    MemberRole: String,
    BotRole: String,
  })
);
