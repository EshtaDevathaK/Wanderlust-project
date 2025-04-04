import express from "express";
import wrapAsync from "../utils/wrapAsync.js"; // ✅ Keep only this one
import ExpressError from "../utils/ExpressError.js";
import Review from "../models/review.js";
import Listing from "../models/listing.js";
import { validateReview, isLoggedIn, isReviewAuthor } from "../middleware.js";
import reviewController from "../controllers/review.js";

const router = express.Router({ mergeParams: true });

// Reviews 
// Post Review route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

export default router;
