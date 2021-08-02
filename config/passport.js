const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user");

module.exports = function(passport, getUserByEmail, getUserById) {
    passport.use(
        new localStrategy({
                usernameField: "email",
            },
            (email, password, done) => {
                //matching the user
                User.findOne({ email: email })
                    .then((user) => {
                        if (!user) {
                            return done(null, false, {
                                message: "The email entered is not registered",
                            });
                        }

                        // matching the password
                        bcrypt.compare(password, user.password, (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                return done(null, user);
                            } else {
                                return done(null, false, {
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
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};