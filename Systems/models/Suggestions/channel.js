const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestionChannel",
  new Schema({
    Channel: String,
    Guild: String,
  })
);
