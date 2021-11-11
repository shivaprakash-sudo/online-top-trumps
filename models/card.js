const mongoose = require("mongoose");
const cardSchema = new mongoose.Schema({
    imgName: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    short_desc: {
        type: String,
        required: true,
    },
    att1: {
        type: String,
        required: true,
    },
    att2: {
        type: String,
        required: true,
    },
    att3: {
        type: String,
        required: true,
    },
    val1: {
        type: Number,
        required: true,
    },
    val2: {
        type: Number,
        required: true,
    },
    val3: {
        type: Number,
        required: true,
    },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;