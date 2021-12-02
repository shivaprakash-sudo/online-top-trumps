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

// handling the POST request to the signup directory:validation checks
router.post("/signup", (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    console.log(" Name: " + name + " Email: " + email + " Pass: " + password);

    // check if user doesn't enter any info
    if (!name || !email || !password || !password2) {
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
            name: name,
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
                res.render("signup", { errors, name, email, password, password2 });
            } else {
                const newUser = new User({
                    name: name,
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

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", {
        user: req.user,
        cards: req.cards,
    });
});

router.get("/profile", ensureAuthenticated, (req, res) => {
    res.render("./partials/profile", {
        user: req.user,
        card: req.card,
    });
});

router.get("/profile_settings", ensureAuthenticated, (req, res) => {
    res.render("./partials/profile_settings", {
        user: req.user,
    });
});

// update user profile route
router.put("/:id", ensureAuthenticated, async(req, res) => {
    let updateUser;

    try {
        updateUser = await User.findById(req.params.id);

        const { name, email, newPassword } = req.body;
        let errors = [];
        console.log(
            " Name: " + name + " Email: " + email + " newPass: " + newPassword
        );

        // check if user doesn't enter any info
        if (!name || !email || !newPassword) {
            errors.push({
                msg: "Please fill in at least one feild to update your profile!",
            });
        }

        // check for the password length
        const MIN_PASS_LENGTH = 8;
        if (oldPassword.length < MIN_PASS_LENGTH) {
            errors.push({
                msg: "Password must be at least 8 characters in length",
            });
        }

        // if there are errors, re-render edit page and show errors
        if (errors.length > 0) {
            res.render("./partials/profile_settings", {
                errors: errors,
                name: name,
                email: email,
                newPassword: newPassword,
            });
        } else {
            // validation is passed if the user enter correct details
            updateUser.updateOne({ email: email }, {
                    $set: {
                        name: name,
                        email: email,
                        password: newPassword,
                    },
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`Updated ${User.fingById(req.params.id).name}`);
                }
            );

            // hashing and encrypting the user password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(updateUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    // save pass to hash
                    updateUser.password = hash;
                    // save user
                    updateUser.save().then((value) => {
                        console.log(value);
                        req.flash(
                            "success_msg",
                            "You have successfully updated your profile!"
                        );
                        res.redirect("/profile");
                    });
                });
            });
        }
    } catch (error) {
        if (updateUser != null) {
            res.render("./partials/profile_settings", {
                user: req.user,
            });
        } else {
            redirect("/");
        }
    }
});

module.exports = router;