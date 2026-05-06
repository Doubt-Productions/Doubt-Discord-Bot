const { connect } = require("mongoose");
const config = require("../config");
const { log } = require("../functions");

module.exports = async () => {
  log("Started connecting to MongoDB...", "warn");

  try {
    await connect(config.handler.mongodb.uri, {
      dbName: config.variables.dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log("MongoDB is connected to the atlas!", "done");
  } catch (err) {
    log(err, "err");
    throw err;
  }
};
