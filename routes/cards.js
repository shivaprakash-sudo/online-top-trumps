const express = require("express");
const router = express.Router();
const Card = require("../models/card");
const User = require("../models/user");
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];
const { ensureAuthenticated } = require("../config/auth");

// All Cards Route
router.get("/", async(req, res) => {
    let query = Card.find();
    if (req.query.cardName != null && req.query.cardName != "") {
        query = query.regex("cardName", new RegExp(req.query.cardName, "i"));
    }
    try {
        const cards = await query.exec();
        res.render("cards/index", {
            cards: cards,
            searchOptions: req.query,
        });
    } catch {
        res.redirect("/");
    }
});

// New Card Route
router.get("/new", ensureAuthenticated, async(req, res) => {
    renderNewPage(res, new Card());
});

// Create Card Route
router.post("/", ensureAuthenticated, async(req, res) => {
    const card = new Card({
        cardName: req.body.cardName,
        attributes: [req.body.attr1, req.body.attr2, req.body.attr3],
        values: [req.body.val1, req.body.val2, req.body.val3],
        addedBy: req.body.user,
        createdAt: new Date(req.body.createdAt),
    });
    savecardImage(card, req.body.cardImage);

    try {
        const newCard = await card.save();
        res.redirect(`cards/${newCard.id}`);
    } catch {
        renderNewPage(res, card, true);
    }
});

// Show Card Route
router.get("/:id", ensureAuthenticated, async(req, res) => {
    try {
        const card = await Card.findById(req.params.id).populate("user").exec();
        res.render("cards/show", { card: card });
    } catch {
        res.redirect("/");
    }
});

// Edit Card Route
router.get("/:id/edit", ensureAuthenticated, async(req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        renderEditPage(res, card);
    } catch {
        res.redirect("/");
    }
});

// Update Card Route
router.put("/:id", ensureAuthenticated, async(req, res) => {
    let card;

    try {
        card = await Card.findById(req.params.id);
        card.cardName = req.body.cardName;
        card.attributes = [req.body.attr1, req.body.attr2, req.body.attr3];
        card.values = [req.body.val1, req.body.val2, req.body.val3];
        card.user = req.body.user;
        if (req.body.cardImage != null && req.body.cardImage !== "") {
            savecardImage(card, req.body.cardImage);
        }
        await card.save();
        res.redirect(`/cards/${card.id}`);
    } catch {
        if (card != null) {
            renderEditPage(res, card, true);
        } else {
            redirect("/");
        }
    }
});

// Delete Card Page
router.delete("/:id", ensureAuthenticated, async(req, res) => {
    let card;
    try {
        card = await Card.findById(req.params.id);
        await card.remove();
        res.redirect("/cards");
    } catch {
        if (card != null) {
            res.render("cards/show", {
                card: card,
                errors: "Uh Oh! Couldn't remove card",
            });
        } else {
            res.redirect("/");
        }
    }
});

async function renderNewPage(res, card, hasError = false) {
    renderFormPage(res, card, "new", hasError);
}

async function renderEditPage(res, card, hasError = false) {
    renderFormPage(res, card, "edit", hasError);
}

async function renderFormPage(res, card, form_type, hasError = false) {
    try {
        const users = await User.find({});
        const params = {
            users: users,
            card: card,
        };
        if (hasError) {
            if (form_type === "edit") {
                params.errors = "Error Updating Card!";
            } else {
                params.errors = "Error Creating Card!";
            }
        }
        res.render(`cards/${form_type}`, params);
    } catch {
        res.redirect("/cards");
    }
}

function savecardImage(card, cardImageEncoded) {
    if (cardImageEncoded == null) return;
    const cardImage = JSON.parse(cardImageEncoded);
    if (cardImage != null && imageMimeTypes.includes(cardImage.type)) {
        card.cardImageImage = new Buffer.from(cardImage.data, "base64");
        card.cardImageImageType = cardImage.type;
    }
}

module.exports = router;