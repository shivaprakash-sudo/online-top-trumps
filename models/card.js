// getting mongoose module for generating a schema
const mongoose = require("mongoose");

// image schema
const ImageSchema = new mongoose.Schema(
    {
        path: String,
        fileName: String
    }
)

// Top Trumps card schema
const cardSchema = new mongoose.Schema({
    cardName: {
        type: String,
        required: true,
    },
    attributes: [String],
    values: [Number],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    cardImageType: ImageSchema,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

// generating the card model from card schema
const Card = mongoose.model("Card", cardSchema);

// exporting card model
module.exports = Card;