import express from "express";
import User from "../models/user.js";
 
import passport from "passport";
import { savedRedirectUrl } from "../middleware.js";
import userController from "../controllers/users.js";
import wrapAsync from "../utils/wrapAsync.js"; // ✅ Default Import (Correct)

const router = express.Router();

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        savedRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: '/login',
            failureFlash: true
        }),
        userController.login
    );

router.get("/logout", userController.logout);

export default router;