const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const Card = require("../models/card");

// login page
router.get("/", async(req, res) => {
    let cards;

    try {
        cards = await Card.find().sort({ createdAt: "desc" }).limit(10).exec();
    } catch (error) {
        cards = [];
    }
    res.render("index", { cards: cards });
});

// sign up page
router.get("/signup", (req, res) => {
    res.render("signup");
});

module.exports = router;