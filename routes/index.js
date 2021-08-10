const express = require("express");
const indexRouter = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// login page
indexRouter.get("/", (req, res) => {
    res.render("index");
});

// sign up page
indexRouter.get("/signup", (req, res) => {
    res.render("signup");
});

indexRouter.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", {
        user: req.user,
    });
});

module.exports = indexRouter;