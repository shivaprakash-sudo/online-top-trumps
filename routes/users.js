// express module for routing
const express = require("express");

// accessing the router function
const router = express.Router();

// bcrypt module for hashing the account password
const bcrypt = require("bcrypt");

// getting the user model
const User = require("../models/user");

// passport module for user authentication
const passport = require("passport");

// getting the function needed to check the authentication
const { ensureAuthenticated } = require("../config/auth");

// getting the card model
const Card = require("../models/card");

// route for accessing and rendering login page
router.get("/login", (req, res) => {
    res.render("login");
});

// route for accessing and rendering login page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// router for posting the login details and
// authenticating them through passport module
router.post("/login", (req, res, next) => {
    // authenitcation check through passport module
    // with respective success and failure redirects
    // and with flashing error messages set to true
    passport.authenticate("local", {
        successRedirect: "/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true,
    })(req, res, next);
});

// router for accessing the posted details from the signup page
router.post("/signup", (req, res) => {
    // getting the required variables from the page body
    const { firstName, lastName, email, password, password2 } = req.body;

    // error messages container
    let errors = [];

    // checking if the user enters any info or not
    if (!firstName || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields!" });
    }

    // checking if the passwords match
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    // checking for the password length, with minimum length set to 8
    const MIN_PASS_LENGTH = 8;
    if (password.length < MIN_PASS_LENGTH) {
        errors.push({ msg: "Password must be at least 8 characters in length" });
    }

    // if there are errors, re-render signup page and show errors
    if (errors.length > 0) {
        res.render("signup", {
            errors: errors,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            password2: password2,
        });
    } else {
        // validation is passed if the user enters correct details
        // ...
        // checking if the entered email already exists or not
        User.findOne({ email: email }).exec((err, user) => {
            // if the email already exists, display an error message
            // and re-render the signup page and fill them with details entered before
            if (user) {
                errors.push({ msg: "This email is already registered" });
                res.render("signup", {
                    errors,
                    firstName,
                    lastName,
                    email,
                    password,
                    password2,
                });
            } else {
                // if no email is found, create a new user
                const newUser = new User({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                });

                // hashing and encrypting the user password using bcrypt module
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // save password to hash
                        newUser.password = hash;
                        // save the newly created user and show a success message
                        newUser
                            .save()
                            .then((value) => {
                                console.log(value);
                                req.flash(
                                    "success_msg",
                                    "You have successfully signed up and can login now"
                                );
                                res.redirect("/users/login");
                            })
                            .catch((value) => console.log(value));
                    });
                });
            }
        });
    }
});

// router for accessing the logout request
router.get("/logout", (req, res) => {
    // logging out
    req.logout();

    // flashing a success message
    req.flash("success_msg", "Successfully logged out");

    // redirecting the user to login page
    res.redirect("/users/login");
});

// router for accessing the dashboard page request
router.get("/dashboard", ensureAuthenticated, async(req, res) => {
    // get cards and sort them in reverse to show the new cards first
    let query = Card.find().sort({ $natural: -1 });

    // rendering the dashboard page after getting the cards
    try {
        // getting the cards and limiting the number to 5
        const cards = await query.limit(5).exec();
        // rendering the dashboard page and sending necessary
        // details to the template engine
        res.render("dashboard", {
            user: req.user,
            cards: cards,
            searchOptions: req.query,
        });
    } catch (error) {
        // console logging the error message, with custom error message
        console.log("Error showing dashboard!");
        console.log(error);

        // redirecting the user to dashboard
        res.redirect("/dashboard");
    }
});

// route for accessing the user profile page request
router.get("/profile", ensureAuthenticated, async(req, res) => {
    // query to find the cards added by the session user
    // and sort them in reverse to display the newly added cards first
    let query = Card.find({
        addedBy: req.session.passport.user,
    }).sort({ $natural: -1 });

    // for search box
    if (req.query.cardName != null && req.query.cardName != "") {
        query = query.regex("cardName", new RegExp(req.query.cardName, "i"));
    }

    // rendering profile page after getting cards
    try {
        // awaiting cards query execution
        const cards = await query.exec();

        // rendering profile page and sending necessary
        // details to the template engine
        res.render("./users/profile", {
            user: req.user,
            cards: cards,
            searchOptions: req.query,
        });
    } catch {
        // redirecting to the profile page, in case of any error
        res.redirect("/profile");
    }
});

// router for deleting the user profile, along with their cards
router.delete("/:id", async(req, res) => {
    try {
        // finding the user by their ID and deleting their data
        let user = await User.findByIdAndDelete(req.params.id);

        // getting the cards through addedBy key and deleting them
        let cards = await Card.deleteMany({
            addedBy: req.params.id,
        });

        // flashing a success message after account deletion
        req.flash("success_msg", "Successfully deleted the profile");

        // redirecting them to the login page
        res.redirect("/users/login");
    } catch (error) {
        console.log(error);
        // redirecting their profile page, in case of any error
        res.redirect("/profile");
    }
});

// route for accessing feedback form
router.get("/feedback", (req, res) => {
    res.render("./partials/feedback");
});

// route for accessing What is Top Trumps? link
router.get("/about-top-trumps", (req, res) => {
    res.render("top_trumps/about", {
        user: req.user,
    });
});

// exporting the users router
module.exports = router;