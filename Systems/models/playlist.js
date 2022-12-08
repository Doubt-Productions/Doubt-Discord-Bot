const mongoose = require("mongoose");

module.exports = mongoose.model(
  "playlist",
  new mongoose.Schema({
    Guild: String,
    User: String,
    Name: String,
    Songs: {
      URL: [],
      NAME: [],
    },
    Privacy: Boolean,
  })
);
