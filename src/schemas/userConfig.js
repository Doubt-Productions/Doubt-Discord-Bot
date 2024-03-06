const { Schema, model } = require('mongoose');

const userConfig = new Schema({
    user: String,
    badges:[String]
})

module.exports = model("Users", userConfig);