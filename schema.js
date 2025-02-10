const Joi = require('joi');
module.exports.listingSchema = Joi.object({
    //ObJect : listings
    listing : Joi.object({
        title : Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
    }).required()
});9
// When some req comes so inside we need something called listing Object


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
    }).required()
})






























































