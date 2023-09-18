const { connect } = require("mongoose");
const config = require("../config");
const { log } = require("../functions");

module.exports = async () => {
  log("Started connecting to MongoDB...", "warn");

  await connect(process.env.MONGODB_URI || config.handler.mongodb.uri, {
    dbName: config.variables.dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      log("MongoDB is connected to the atlas!", "done");
    })
    .catch((err) => log(err, "err"));
};
