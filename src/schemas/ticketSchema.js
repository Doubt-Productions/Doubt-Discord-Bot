const { model, Schema } = require("mongoose");

const ticketSchema = new Schema({
  Guild: String,
  Channel: String,
  Ticket: String,
  Role: String,
});

module.exports = model("tickets", ticketSchema);
