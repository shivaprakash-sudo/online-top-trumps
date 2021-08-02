const express = require("express");
const loginRouter = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// login page
loginRouter.get("/", (req, res) => {
    res.render("index");
});

// sign up page
loginRouter.get("/signup", (req, res) => {
    res.render("signup");
});

loginRouter.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", {
        user: req.user,
    });
});

module.exports = loginRouter;