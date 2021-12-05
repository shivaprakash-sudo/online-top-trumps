const mongoose = require("mongoose");
const path = require("path");

const cardImageBasePath = "uploads/cardImages";

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
    // cardImage: {
    //     type: Buffer,
    //     required: true,
    // },
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

cardSchema.virtual("cardImagePath").get(function() {
    // this.cardImage != null &&
    if (this.cardImageType != null) {
        // return `data:${
        //   this.cardImageType
        // };charset=utf-8;base64,${this.cardImage.toString("base64")}`;
        return path.join("/", cardImageBasePath, this.cardImageType);
    }
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
module.exports.cardImageBasePath = cardImageBasePath;