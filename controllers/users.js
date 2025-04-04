import User from "../models/user.js"; // Changed require() to import

const userController = {
    renderSignupForm: (req, res) => {
        // Ensure currUser is null for signup page
        res.locals.currUser = null;
        res.render("users/signup.ejs");
    },

    signup: async (req, res, next) => {
        try {
            let { username, email, password } = req.body;
            const newUser = new User({ email, username });
            const registeredUser = await User.register(newUser, password);
            
            req.login(registeredUser, (err) => {
                if (err) {
                    req.flash("error", "Error during login after signup");
                    return res.redirect("/signup");
                }
                req.flash("success", "Welcome to Wanderlust! Your Account Has Been Created.");
                res.redirect("/listings");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    },

    renderLoginForm: (req, res) => {
        // Ensure currUser is null for login page
        res.locals.currUser = null;
        res.render("users/login.ejs");
    },

    login: async (req, res) => {
        req.flash("success", "Welcome Back to Wanderlust!");
        const redirectUrl = req.session.returnTo || "/listings";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    },

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Goodbye!");
            res.redirect("/listings");
        });
    }
};

export default userController;