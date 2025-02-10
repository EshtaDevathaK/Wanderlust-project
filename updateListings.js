const express = require('express');
const Listing = require('./models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();

const app = express();
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust", { useNewUrlParser: true, useUnifiedTopology: true });

// Route to update location
app.post('/update-location', async (req, res) => {
    const { location } = req.body;
    try {
        // Geocode the new location to get coordinates
        const geocodeResponse = await geocodingClient.forwardGeocode({
            query: location,
            limit: 1,
        }).send();

        if (geocodeResponse.body.features.length) {
            const coordinates = geocodeResponse.body.features[0].geometry.coordinates;

            // Find the listing by title (or another unique identifier)
            const listing = await Listing.findOne({ title: 'hey' });  // Modify as needed to find the correct listing

            if (listing) {
                // Update the listing with the new location and coordinates
                listing.location = location;
                listing.geometry.coordinates = coordinates;

                // Save the updated listing
                await listing.save();

                // Respond with the updated coordinates
                res.json({ success: true, coordinates: coordinates });
            } else {
                res.status(404).json({ success: false, message: 'Listing not found' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Location could not be geocoded' });
        }
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server is listening on Port: ${port}`);
});


// const mongoose = require("mongoose");
// const Listing = require("./models/listing");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// require("dotenv").config();

// const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

// const updateListings = async () => {
//     const listings = await Listing.find({ "geometry.coordinates": [0, 0] });

//     for (let listing of listings) {
//         if (!listing.location) continue;

//         // Forward geocoding to get coordinates from location
//         const response = await geocodingClient.forwardGeocode({
//             query: listing.location,
//             limit: 1,
//         }).send();

//         if (response.body.features.length) {
//             // Update coordinates
//             listing.geometry.coordinates = response.body.features[0].geometry.coordinates;
            
//             // Reverse geocoding to get a detailed address
//             const reverseResponse = await geocodingClient.reverseGeocode({
//                 query: listing.geometry.coordinates,
//                 types: ["address"]
//             }).send();

//             // Save the detailed address in the 'location' field or another field
//             if (reverseResponse.body.features.length) {
//                 listing.location = reverseResponse.body.features[0].place_name; // Save the full address here
//             }

//             // Save the updated listing
//             await listing.save();
//             console.log(`Updated: ${listing.title}`);
//         } else {
//             console.log(`Failed for: ${listing.title}`);
//         }
//     }

//     mongoose.connection.close();
// };

// updateListings();
