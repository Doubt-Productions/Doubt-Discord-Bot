const { model, Schema } = require("mongoose");

const BooleanReq = {
  type: Boolean,
  default: false,
};

const StringReq = {
  type: String,
  default: null,
};

const NumberReq = {
  type: Number,
  default: 0,
};

module.exports = model(
  "automod-settings",
  new Schema({
    Guild: StringReq,
    AntiLink: BooleanReq,
    AntiSpam: BooleanReq,
    AntiSpamChannel: StringReq,
    AntiCaps: BooleanReq,
    AntiMassMention: BooleanReq,
    AntiMassMentionCount: NumberReq,
    AntiPhishing: BooleanReq,
    AntiPhishingChannel: StringReq,
  })
);
