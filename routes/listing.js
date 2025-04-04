import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import Listing from "../models/listing.js";
import User from "../models/user.js";
import { isLoggedIn, isOwner, validateListing } from "../middleware.js";
import listingController from "../controllers/listings.js";
import multer from "multer";
import { storage } from "../cloudConfig.js"; // Cloudinary Storage

const router = express.Router();
const upload = multer({ storage }); // Multer stores in Cloudinary storage

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

export default router; // ✅ Use default export
