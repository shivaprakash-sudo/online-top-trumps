// getting mongoose module for generating a schema
const mongoose = require("mongoose");

// getting path module to use relative paths
const path = require("path");

// path for images when user uploads them
const cardImageBasePath = "uploads/cardImages";

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
    cardImageType: {
        type: String,
        required: true,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

// returning the relative image path
cardSchema.virtual("cardImagePath").get(function() {
    if (this.cardImageType != null) {
        return path.join("/", cardImageBasePath, this.cardImageType);
    }
});

// generating the card model from card schema
const Card = mongoose.model("Card", cardSchema);

// exporting card model
module.exports = Card;

// exporting image upload path
module.exports.cardImageBasePath = cardImageBasePath;