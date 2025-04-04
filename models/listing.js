// step : 4 : requiring Mongoose :
import mongoose from "mongoose";
import Review from "./review.js";

// step : 5 : Declaring a variable [Schema] to store mongoose
const Schema = mongoose.Schema;

//step : 5 : listingSchema --> Using this Schema We are going to create a model
const listingSchema = new Schema({
    title: {
        type: String
    },
    description: String,
    image: {
        url: String,
        filename: String,
    }
    ,
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    geometry :{
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
});

listingSchema.post("findOneAndDelete", async (listing)=>{
 if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
 }
});

// step : 6 : listingSchema --> Using this Schema We are going to create a model
// So below written is Our model 
const Listing = mongoose.model("Listing", listingSchema);

// step : 7 : We are going to export this model in app.js [model Exporting Process - refer :]
export default Listing; // ✅ Now it works with `import`
