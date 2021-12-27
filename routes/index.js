// getting the express module for routing
const express = require("express");

// getting the Router function from express
const router = express.Router();

// route for accessing and rendering the home page
router.get("/", (req, res) => {
    res.render("index");
});

// exporting the index router
module.exports = router;