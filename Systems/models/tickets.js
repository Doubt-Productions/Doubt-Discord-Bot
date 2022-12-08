const { model, Schema } = require("mongoose");

let ticketSchema = new Schema({
  GuildId: String,
  MembersID: [String],
  TicketID: String,
  ChannelID: String,
  Closed: Boolean,
  Locked: Boolean,
  Type: String,
  Claimed: Boolean,
  ClaimedBy: String,
});

module.exports = model("tickets", ticketSchema);
