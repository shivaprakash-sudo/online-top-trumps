// exporting a function to ensure a user is logged in
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        // if user is logged in, go to the next middleware
        if (req.isAuthenticated()) {
            return next();
        }
        // displays the error message if user is not logged in
        req.flash("error_msg", "Please, login to view this resource");

        // redirects to login page, if the webpage requires the user to be logged in
        res.redirect("/users/login");
    },
};