// step : 4 : requiring Mongoose :
const mongoose = require("mongoose");

// step : 5 : Declaring a variable [Schema] to store mongoose
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports = mongoose.model("Review", reviewSchema);
// One to many relationShips
// Listing 1 -> Will have many reviews One card Of Details(The Specific Place) Will hold Thousands of Reviews


