const express= require("express");
const router= express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js");

router
.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup)
);

router
.route("/login")
.get(userController.renderLogin)
.post(saveRedirectUrl, async (req, res, next) => {

    const { username } = req.body;

    // Check whether the user exists
    const existingUser = await User.findOne({ username });

    if (!existingUser) {
        req.flash("error", "No account found. Please sign up to continue.");
        return res.redirect("/signup");
    }

    passport.authenticate("local", (err, user, info) => {

        if (err) return next(err);

        if (!user) {
            req.flash("error", "Invalid username or password.");
            return res.redirect("/login");
        }

        req.logIn(user, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome back!");

            let redirectUrl = res.locals.redirectUrl || "/listings";
            return res.redirect(redirectUrl);
        });

    })(req, res, next);
});



router.get("/logout",userController.logout);

module.exports= router;