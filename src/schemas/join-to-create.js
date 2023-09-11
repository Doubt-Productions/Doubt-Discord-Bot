const { model, Schema } = require('mongoose');

const joinToCreateSchema = new Schema({
    Guild: String,
    Channel: String,
    UserLimit: Number,
});

module.exports = model('join-to-create', joinToCreateSchema);