import Listing from "../models/listing.js"; // Changed require() to import
import Review from "../models/review.js"; // Changed require() to import

const reviewController = {
    createReview: async (req, res) => { // Changed module.exports to export
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        console.log(newReview);
        listing.reviews.push(newReview);

        await newReview.save();
        // Any changes need to be done in Existing Database
        await listing.save();
        req.flash("success", "New Review Created!");
        res.redirect(`/listings/${listing._id}`);
    },

    destroyReview: async (req, res) => { // Changed module.exports to export
        let { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    }
};

export default reviewController;






    