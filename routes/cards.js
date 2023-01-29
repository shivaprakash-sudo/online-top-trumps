// express module for routing
const express = require("express");

// accessing the router function
const router = express.Router();

// multer module for image uploads
const multer = require("multer");

// path module for getting relative paths
const path = require("path");

// getting the card model
const Card = require("../models/card");

// getting the user model
const User = require("../models/user");

// setting the upload path in Public folder
const uploadPath = path.join("tmp", Card.cardImageBasePath);

// setting the acceptable image file formats
const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

// getting the authorization function to check for user login
const { ensureAuthenticated } = require("../config/auth");

// setting the file fiter for getting only the acceptable image formats and the upload destination path
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

// route for accessing all cards page
router.get("/", ensureAuthenticated, async(req, res) => {
    // getting the cards and sorting them in reverse
    let query = Card.find().sort({ $natural: -1 });

    // getting the user from the session
    let user = req.session.passport.user;

    // getting cards added by the user from the specific session
    let addedBy = Card.find({
        addedBy: user,
    });

    // using regex for searching the cards using card name
    if (req.query.cardName != null && req.query.cardName != "") {
        query = query.regex("cardName", new RegExp(req.query.cardName, "i"));
    }

    // try block for executing the query
    try {
        // getting the cards after query is executed
        const cards = await query.exec();

        // getting the cards added by the session user
        const userCards = await addedBy.exec();

        // rendering the index page for all cards, while getting
        // the session user info and sending the required data to the template engine
        res.render("cards/index", {
            user: req.user,
            cards: cards,
            userCards: userCards,
            searchOptions: req.query,
        });
    } catch {
        // redirecting to the same all cards route again, if there is an error
        res.redirect("/");
    }
});

// route for accessing new card page
router.get("/new", ensureAuthenticated, async(req, res) => {
    // rendering new card page using a custom function
    renderNewPage(res, new Card());
});

// route for posting the card details to the server and then storing them in the database
router.post(
    "/",
    ensureAuthenticated,
    upload.single("cardImage"),
    async(req, res) => {
        // getting the file name from the file, if there is one
        const fileName = req.file != null ? req.file.filename : null;

        // getting the required data variables from the body of the page
        const { cardName, attr1, attr2, attr3, val1, val2, val3 } = req.body;

        // creating a new card from the variables we recieved from the body
        const card = new Card({
            cardName: cardName,
            attributes: [attr1, attr2, attr3],
            values: [val1, val2, val3],
            cardImageType: fileName,
            addedBy: req.session.passport.user,
        });

        // try block for saving the card details
        try {
            // saving the new card to the database
            const newCard = await card.save();

            // redirecting the user to the newly created card
            res.redirect(`cards/${newCard.id}`);
        } catch (error) {
            // outputting the error message to the console
            console.log(error);

            // rendering the new page again, because of some error
            renderNewPage(res, card, true);
        }
    }
);

// route for accessing single card details
router.get("/:id", ensureAuthenticated, async(req, res) => {
    // getting the card details and rendering a page to show it
    try {
        // getting the card details using its ID and
        // populating it with the name of the user who created it
        const card = await Card.findById(req.params.id).populate("addedBy").exec();

        // rendering the page for showing the card details
        // by sending the card details to the template engine
        res.render("cards/show", { card: card });
    } catch {
        // redirecting the user to all cards route, in case of any error
        res.redirect("/");
    }
});

// route for accessing the edit card page
router.get("/:id/edit", ensureAuthenticated, async(req, res) => {
    try {
        // getting the card details by its ID
        const card = await Card.findById(req.params.id);

        // rendering the edit page through custom function
        renderEditPage(res, card);
    } catch {
        // redirecting the user to all cards route, in case of any error
        res.redirect("/");
    }
});

// route for accessing the update card page
router.put("/:id", ensureAuthenticated, async(req, res) => {
    let card;

    // finding the card by its ID and updating its values
    try {
        // getting the card by its ID from the database
        card = await Card.findById(req.params.id);

        // updating the card variable values
        card.cardName = req.body.cardName;
        card.attributes = [req.body.attr1, req.body.attr2, req.body.attr3];
        card.values = [req.body.val1, req.body.val2, req.body.val3];
        card.user = req.body.user;

        // saving the card image, if there is an image
        if (req.body.cardImage != null && req.body.cardImage !== "") {
            savecardImage(card, req.body.cardImage);
        }

        // waiting for the card to be saved
        await card.save();

        // redirecting the user to "/:id" route
        res.redirect(`/cards/${card.id}`);
    } catch {
        if (card != null) {
            // render card edit page, in case of any error
            renderEditPage(res, card, true);
        } else {
            // redirect to all cards route otherwise
            redirect("/");
        }
    }
});

// route for deleting the card from the database
router.delete("/:id", ensureAuthenticated, async(req, res) => {
    let card;

    // finding card by ID, removing it and rendering all cards page
    try {
        // getting the card by its ID
        card = await Card.findById(req.params.id);

        // removing the card from the database
        await card.remove();

        // redirecting the user to all cards page
        res.redirect("/cards");
    } catch {
        // if the card is not null
        if (card != null) {
            // rendering the card page, with an error message
            res.render("cards/show", {
                card: card,
                errors: "Uh Oh! Couldn't remove card",
            });
        } else {
            // otherwise redirect them to the all cards page
            res.redirect("/");
        }
    }
});

// asynchronous function for rendering a new card page
async function renderNewPage(res, card, hasError = false) {
    // custom function to generate a form page for the new card page
    renderFormPage(res, card, "new", hasError);
}

// asynchronous function for rendering a new card page
async function renderEditPage(res, card, hasError = false) {
    // custom function to generate a form page for the edit card page
    renderFormPage(res, card, "edit", hasError);
}

// custom asynchronous function for generating a new form page depending
// on the form type we need
async function renderFormPage(res, card, form_type, hasError = false) {
    try {
        // getting the users from the database
        const users = await User.find({});

        // defining the parameters
        const params = {
            users: users,
            card: card,
        };

        // if there is any error show error message based on the form type
        if (hasError) {
            if (form_type === "edit") {
                params.errors = "Error Updating Card!";
            } else {
                params.errors = "Error Creating Card!";
            }
        }

        // finally render edit or new pages depending on the form type
        res.render(`cards/${form_type}`, params);
    } catch {
        // outputting error message to the console
        console.log("Error!");

        // redirect to all cards page, in case of any error
        res.redirect("/cards");
    }
}

// to save the card image by encodin it in base 64
function savecardImage(card, cardImageEncoded) {
    if (cardImageEncoded == null) return;
    const cardImage = JSON.parse(cardImageEncoded);
    if (cardImage != null && imageMimeTypes.includes(cardImage.type)) {
        card.cardImage = new Buffer.from(cardImage.data, "base64");
        card.cardImageType = cardImage.type;
    }
}

// exporting the cards router
module.exports = router;