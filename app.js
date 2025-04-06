// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Import required modules
import express from "express";
import mongoose from "mongoose";
import path from "path";
import methodOverride from "method-override";
import ejsMate from "ejs-mate";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import MongoStore from "connect-mongo";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import models and utilities
import ExpressError from "./utils/ExpressError.js";
import User from "./models/user.js";

// Import routes
import listingRouter from "./routes/listing.js";
import reviewRouter from "./routes/review.js";
import userRouter from "./routes/user.js";

// Fix for missing __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// MongoDB Connection
const dbUrl = process.env.ATLASDB_URL;
async function connectDB() {
    try {
        // Simplified MongoDB connection without deprecated options
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB");
        
        // Clean up sessions collection on startup
        try {
            const sessionCollection = mongoose.connection.db.collection('sessions');
            // Remove expired sessions
            await sessionCollection.deleteMany({
                expires: { $lt: new Date() }
            });
            console.log("✅ Cleaned up expired sessions");
        } catch (cleanupError) {
            console.log("Note: Session cleanup not required");
        }
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit if database connection fails
    }
}
connectDB();

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Trust proxy for secure cookies in production
if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
    // Force HTTPS in production
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
        next();
    });
}

// MongoDB Session Store with proper configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret: process.env.SECRET
    },
    collectionName: 'sessions'
});

store.on('error', function(error) {
    console.error('Session Store Error:', error);
});

// Session configuration with secure settings
const sessionOptions = {
    store,
    name: 'sessionId',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
    }
};

// Initialize core middleware in correct order
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configure passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and User Data Middleware
app.use((req, res, next) => {
    // Set flash messages
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    
    // Set current user
    res.locals.currUser = req.user;
    
    // Debug logging
    console.log('Session ID:', req.sessionID);
    console.log('Flash Messages:', {
        success: res.locals.success,
        error: res.locals.error
    });
    
    next();
});

// Root route - show listings or redirect based on authentication
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/listings");
    } else {
        res.redirect("/listings");
    }
});

// Temporary cleanup route to remove sample listings
app.get("/cleanup-all-listings", async (req, res) => {
    try {
        const Listing = mongoose.model('Listing');
        
        // First, get a count of all listings
        const beforeCount = await Listing.countDocuments();
        
        // Delete all listings with the sample owner ID
        const result = await Listing.deleteMany({
            owner: new mongoose.Types.ObjectId("679f07b22073171c6afd36e2")
        });
        
        // Get count after deletion
        const afterCount = await Listing.countDocuments();
        
        res.json({
            message: "Cleanup completed",
            beforeCount,
            afterCount,
            deletedCount: beforeCount - afterCount,
            result
        });
    } catch (err) {
        console.error("Cleanup error:", err);
        res.status(500).json({
            error: err.message,
            stack: err.stack
        });
    }
});

// Routes
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// 404 Error Handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const { statusCode = 500, message = "Something Went Wrong" } = err;
    console.error("🔥 Error Middleware Caught:", err);
    res.status(statusCode).render("error.ejs", { message });
});

// Global Error Handling for Uncaught Exceptions
process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error("🔥 Unhandled Promise Rejection:", err);
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === "production") {
        console.log("Running in production mode");
        console.log("Session secure:", sessionOptions.cookie.secure);
        console.log("Session sameSite:", sessionOptions.cookie.sameSite);
    }
});


















