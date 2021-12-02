const mongoose = require("mongoose");

const reqString = {
    type: String,
    required: true,
};

const cardSchema = new mongoose.Schema({
    cardName: reqString,
    attributes: [String],
    values: [Number],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    cardImage: {
        type: Buffer,
        required: true,
    },
    cardImageType: reqString,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

cardSchema.virtual("cardImagePath").get(function() {
    if (this.cardImage != null && this.cardImageType != null) {
        return `data:${
      this.cardImageType
    };charset=utf-8;base64,${this.cardImage.toString("base64")}`;
    }
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;