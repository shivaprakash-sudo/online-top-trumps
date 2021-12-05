const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Card = require("../models/card");
const User = require("../models/user");

const uploadPath = path.join("public", Card.cardImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
const { ensureAuthenticated } = require("../config/auth");

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

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
router.post(
    "/",
    ensureAuthenticated,
    upload.single("cardImage"),
    async(req, res) => {
        const fileName = req.file != null ? req.file.filename : null;
        const { cardName, attr1, attr2, attr3, val1, val2, val3 } = req.body;

        console.log({
            cardName: cardName,
            attributes: [attr1, attr2, attr3],
            values: [val1, val2, val3],
            cardImageType: fileName,
        });

        // let errors = [];

        // if (!cardName || !attr1 || !attr2 || !attr3 || !val1 || !val2 || !val3) {
        //     errors.push({
        //         msg: "Please fill in all fields to create a card",
        //     });
        // }

        // // if there are any errors, re-render the page
        // if (errors.length > 0) {
        //     res.render("cards/new", {
        //         errors: errors,
        //         cardName: cardName,
        //         attr1: attr1,
        //         attr2: attr2,
        //         attr3: attr3,
        //         val1: val1,
        //         val2: val2,
        //         val3: val3,
        //     });
        // } else {}
        const card = new Card({
            cardName: cardName,
            attributes: [attr1, attr2, attr3],
            values: [val1, val2, val3],
            cardImageType: fileName,
            addedBy: req.session.passport.user,
        });
        // savecardImage(card, cardImage);

        try {
            const newCard = await card.save();
            res.redirect(`cards/${newCard.id}`);
            //res.redirect("cards");
        } catch (error) {
            console.log(error);
            renderNewPage(res, card, true);
        }
    }
);

// Show Card Route
router.get("/:id", ensureAuthenticated, async(req, res) => {
    try {
        const card = await Card.findById(req.params.id).populate("addedBy").exec();
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
        console.log("Error!");
        res.redirect("/cards");
    }
}

function savecardImage(card, cardImageEncoded) {
    if (cardImageEncoded == null) return;
    const cardImage = JSON.parse(cardImageEncoded);
    if (cardImage != null && imageMimeTypes.includes(cardImage.type)) {
        card.cardImage = new Buffer.from(cardImage.data, "base64");
        card.cardImageType = cardImage.type;
    }
}

module.exports = router;