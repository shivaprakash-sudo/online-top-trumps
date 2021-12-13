const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");
const Card = require("../models/card");

// login handle
router.get("/login", (req, res) => {
    res.render("login");
});

// sign up handle
router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true,
    })(req, res, next);
});

// POST request to the signup
router.post("/signup", (req, res) => {
    const { firstName, lastName, email, password, password2 } = req.body;
    let errors = [];
    console.log({
        firstName: firstName,
        lastName: lastName,
        Email: email,
        Pass: password,
    });

    // check if user doesn't enter any info
    if (!firstName || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields!" });
    }

    // check if the passwords match
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    // check for the password length
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
        // validation is passed if the user enter correct details
        User.findOne({ email: email }).exec((err, user) => {
            console.log(user);
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
                const newUser = new User({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                });

                // hashing and encrypting the user password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // save pass to hash
                        newUser.password = hash;
                        // save user
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

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Successfully logged out");
    res.redirect("/users/login");
});

router.get("/dashboard", ensureAuthenticated, async(req, res) => {
    let query = Card.find();
    if (req.query.cardName != null && req.query.cardName != "") {
        query = query.regex("cardName", new RegExp(req.query.cardName, "i"));
    }
    try {
        const cards = await query.limit(5).exec();
        res.render("dashboard", {
            user: req.user,
            cards: cards,
            searchOptions: req.query,
        });
    } catch (error) {
        console.log("Error showing dashboard!");
        console.log(error);
        res.redirect("/dashboard");
    }
});

router.get("/profile", ensureAuthenticated, async(req, res) => {
    const query = Card.find({
        addedBy: req.session.passport.user,
    });

    // const totalCards = query.countDocuments();

    if (req.query.cardName != null && req.query.cardName != "") {
        query = query.regex("cardName", new RegExp(req.query.cardName, "i"));
    }
    try {
        const cards = await query.exec();
        res.render("./partials/profile", {
            user: req.user,
            cards: cards,
            // cardCount: totalCards,
        });
    } catch {
        res.redirect("/profile");
    }
});

// getting user profile
router.get("/profile_settings", ensureAuthenticated, (req, res) => {
    res.render("./partials/profile_settings", {
        user: req.user,
    });
});

// deleting the user profile. along with their cards
router.delete("/:id", async(req, res) => {
    try {
        let user = await User.findByIdAndDelete(req.params.id);
        let cards = await Card.deleteMany({
            addedBy: req.params.id,
        });
        res.redirect("/users/login");
    } catch (error) {
        console.log(error);
        res.redirect("/profile_settings");
    }
});

router.get("/feedback", (req, res) => {
    res.render("./partials/feedback");
});

router.get("/about-top-trumps", (req, res) => {
    res.render("top_trumps/about", {
        user: req.user,
    });
});

module.exports = router;