// getting localStrategy from passport-local for user session
const localStrategy = require("passport-local").Strategy;

// getting bcrypt for hashing password
const bcrypt = require("bcrypt");

// getting the user model
const User = require("../models/user");

// exporting a function which checks for user details with their email
module.exports = function(passport) {
    passport.use(
        new localStrategy({
                usernameField: "email",
            },
            (email, password, done) => {
                //matching the user with email
                User.findOne({ email: email })
                    .then((user) => {
                        if (!user) {
                            return done(null, false, {
                                // displaying the error message
                                message: "The email entered is not registered",
                            });
                        }

                        // matching the password
                        bcrypt.compare(password, user.password, (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                // if details match, user is returned
                                return done(null, user);
                            } else {
                                return done(null, false, {
                                    // displaying the error message
                                    message: "Password is incorrect!",
                                });
                            }
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        )
    );

    // saving user details for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // deleting the user details for the session
    passport.deserializeUser((id, done) => {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};