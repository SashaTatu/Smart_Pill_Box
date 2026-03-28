const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    chatId: { type: Number, unique: true, required: true },
    firstName: String,
    deviceID: { type: String, unique: true, required: true },
    pills: [{
        name: String,
        time: String, 
        isTaken: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('User', userSchema);