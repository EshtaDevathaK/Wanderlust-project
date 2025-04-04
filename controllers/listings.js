import dotenv from "dotenv";
dotenv.config();

import Listing from "../models/listing.js"; 
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

const listingController = {
    index: async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    },

    showListing: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing You Requested Does Not Exist");
            return res.redirect("/listings");
        }

        console.log(listing);
        res.render("listings/show.ejs", { listing });
    },

    createListing: async (req, res, next) => {
        try {
            let response = await geocodingClient.forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            }).send();

            if (!response.body.features.length) {
                req.flash("error", "Invalid location!");
                return res.redirect("/listings/new");
            }

            const coordinates = response.body.features[0].geometry.coordinates;
            const newListing = new Listing(req.body.listing);
            newListing.owner = req.user._id;
            newListing.geometry = { type: "Point", coordinates };

            if (req.file) {
                newListing.image = { url: req.file.path, filename: req.file.filename };
            }

            await newListing.save();
            req.flash("success", "New Listing Created!");
            res.redirect(`/listings/${newListing._id}`);
        } catch (err) {
            console.error("Error creating listing:", err);
            next(err);
        }
    },

    renderNewForm: (req, res) => {
        res.render("listings/new.ejs");
    },

    renderEditForm: async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing Not Found!");
            return res.redirect("/listings");
        }

        let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
        res.render("listings/edit.ejs", { listing, originalImageUrl });
    },

    updateListing: async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing Not Found!");
            return res.redirect("/listings");
        }

        listing.set(req.body.listing);

        if (req.body.listing.location && req.body.listing.location !== listing.location) {
            try {
                let response = await geocodingClient.forwardGeocode({
                    query: req.body.listing.location,
                    limit: 1,
                }).send();

                if (!response.body.features.length) {
                    req.flash("error", "Invalid location!");
                    return res.redirect(`/listings/${id}/edit`);
                }

                listing.geometry = { type: "Point", coordinates: response.body.features[0].geometry.coordinates };
            } catch (err) {
                console.error("Geocoding error:", err);
                req.flash("error", "Error fetching location coordinates.");
                return res.redirect(`/listings/${id}/edit`);
            }
        }

        if (req.file) {
            listing.image = { url: req.file.path, filename: req.file.filename };
        }

        await listing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    },

    destroyListing: async (req, res) => {
        let { id } = req.params;
        let deletedList = await Listing.findByIdAndDelete(id);
        console.log(deletedList);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    }
};

export default listingController;
