// getting mongoose module for generating a schema
const mongoose = require("mongoose");

// user schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// generating user model from user schema
const User = mongoose.model("User", userSchema);

// exporting the user model
module.exports = User;