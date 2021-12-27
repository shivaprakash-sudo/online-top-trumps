// checks to see if development dependencies are required or not
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

// getting the required modules

// for routing
const express = require("express");
const app = express();

// for schema and data modelling
const mongoose = require("mongoose");

// for layout
const expressLayouts = require("express-ejs-layouts");

// for user session
const session = require("express-session");

// for flashing error or success messages
const flash = require("connect-flash");

// for user authentication
const passport = require("passport");
require("./config/passport")(passport);

// for overriding form methods
const methodOverride = require("method-override");

// getting the routes

// for index
const indexRouter = require("./routes/index");

// for users
const userRouter = require("./routes/users");

// for cards
const cardRouter = require("./routes/cards");

// setting up template engine and layout
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(expressLayouts);
app.use(methodOverride("_method"));

// database connection
mongoose
    .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        // listening for requests
        app.listen(process.env.PORT || 3000);
        console.log("Connected to Mongoose");
    })
    .catch((err) => {
        console.log("Error connecting to Mongoose");
        console.log(err);
    });

//using express static for getting static files
app.use(express.static("public"));

// using bodyparser
app.use(
    express.urlencoded({
        extended: false,
    })
);

// using express session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

// using passport functions to authentication and session initialization
app.use(passport.initialize());
app.use(passport.session());

// using the flash to display respective messages
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// using the routes to serve files and data
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/cards", cardRouter);