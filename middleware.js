const Listing = require("./models/listing.js");

const Review = require("./models/review.js");

const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next)=>{
    
    if(!req.isAuthenticated()){
        // redirectUrl Save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must Login To Create A Listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.savedRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
// Who ever is the currUser -> Checks that currUser is Our Listings Specific User Or Not
module.exports.isOwner = async(req, res, next)=>{
    let{id} = req.params; //extracting id
    let listing = await  Listing.findById(id);
 
    if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error", "You Are Not The Owner Of This Listing");
    return res.redirect(`/listings/${id}`);
 }
 next();
};
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // Destructure error
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg); // Pass the formatted error message
    } else {
        next();
    }
};

//validateReview for SChema :[ MIDDLEWARE ]
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // Destructure error
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg); // Pass the formatted error message
    } else {
        next();
    }
};


// Only SPecified User can delete their Post/review none Other can delte the Review
module.exports.isReviewAuthor = async(req, res, next)=>{
    let{id, reviewId} = req.params; //extracting id
    let review = await  Review.findById(reviewId);
 
    if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error", "You Are Not The Owner Of This Listing");
    return res.redirect(`/listings/${id}`);
 }
 next();
};