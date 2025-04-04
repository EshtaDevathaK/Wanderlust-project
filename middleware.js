import Listing from "./models/listing.js";
import Review from "./models/review.js";
import ExpressError from "./utils/ExpressError.js";
import { listingSchema, reviewSchema } from "./schema.js";

export function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        // Save redirect URL
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must Login To Create A Listing!");
        return res.redirect("/login");
    }
    next();
}

export function savedRedirectUrl(req, res, next) {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

export async function isOwner(req, res, next) {
    let { id } = req.params; // Extracting id
    let listing = await Listing.findById(id);

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You Are Not The Owner Of This Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

export function validateListing(req, res, next) {
    let { error } = listingSchema.validate(req.body); // Destructure error
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Pass the formatted error message
    } else {
        next();
    }
}

export function validateReview(req, res, next) {
    let { error } = reviewSchema.validate(req.body); // Destructure error
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Pass the formatted error message
    } else {
        next();
    }
}

export async function isReviewAuthor(req, res, next) {
    let { id, reviewId } = req.params; // Extracting id
    let review = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You Are Not The Owner Of This Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
