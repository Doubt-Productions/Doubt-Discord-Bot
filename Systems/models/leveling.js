const { model, Schema } = require("mongoose");

module.exports = model(
  "leveling",
  new Schema({
    Guild: String,
    Enabled: Boolean,
  })
);
