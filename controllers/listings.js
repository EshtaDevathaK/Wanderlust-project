 const Listing  = require("../models/listing");
const User = require('../models/user');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res)=>{
    const allListings =  await Listing.find({});
        res.render("listings/index.ejs", { allListings });
        // Next step --. Setting Up ejs : )
    }

    module.exports.showListing = async (req, res) =>{
        let{id} = req.params; //extracting id
    
        const listing = await Listing.findById(id)
        .populate({path: "reviews", populate: {
          path: "author",  
        },
    })
        .populate("owner"); //Based on Id we will be finding and diplaying the data in Home page
        if(!listing){
            req.flash("error", "Listing You Requested Does Not Exists");
            res.redirect("/listings"); //Redirect to index page
        }
        console.log(listing);
        res.render("listings/show.ejs", { listing });
     
     }


     module.exports.createListing = async (req, res, next) => {
        try {
            // Forward geocoding to get coordinates
            let response = await geocodingClient.forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            }).send();
    
            console.log("Geocoding response:", response.body); // Debugging log
            
            if (!response.body.features.length) {
                req.flash("error", "Invalid location!");
                return res.redirect("/listings/new");
            }
    
            const coordinates = response.body.features[0].geometry.coordinates;
            const newListing = new Listing(req.body.listing);
    
            newListing.owner = req.user._id;
            newListing.geometry = {
                type: "Point",
                coordinates: coordinates,
            };
    
            if (req.file) {
                const { path, filename } = req.file;
                newListing.image = { url: path, filename };
            }
    
            if (!mapToken) {
                console.error("Error: MAP_TOKEN is missing!");
                req.flash("error", "Server misconfiguration: Contact support.");
                return res.redirect("/listings/new");
            }
    
            // Save the new listing to the database
            await newListing.save();
    
            req.flash("success", "New Listing Created!");
            res.redirect(`/listings/${newListing._id}`);
        } catch (err) {
            console.error("Error creating listing:", err);
            next(err); // Pass errors to the error handler
        }
    };
    

// module.exports.createListing = async (req, res, next) => {try {
//                     // Forward geocoding to get coordinates
//                     let response = await geocodingClient.forwardGeocode({
//                         query: req.body.listing.location,
//                         limit: 1,
//                     }).send();
            
// if (!response.body.features.length) {
//                         req.flash("error", "Invalid location!");
//                         return res.redirect("/listings/new");
//                     }
            
//                     // Extract coordinates from the geocoding response
// const coordinates = response.body.features[0].geometry.coordinates;
            
//                     // Create a new listing object
// const newListing = new Listing(req.body.listing);
            
//                     // Set the owner field to the current user's ID
// newListing.owner = req.user._id;
            
//                     // Set the geometry field
// newListing.geometry = {
//                         type: "Point",
//                         coordinates: coordinates,
//                     };
            
//                     // Handle image upload
// if (req.file) {
//                         const { path, filename } = req.file;
//                         newListing.image = { url: path, filename };
//                     }
//                     if (!mapToken) {
//                         console.error("Error: MAP_TOKEN is missing!");
//                         req.flash("error", "Server misconfiguration: Contact support.");
//                         return res.redirect("/listings/new");
//                     }
                    
            
//                     // Save the new listing to the database
// await newListing.save();
            
//                     req.flash("success", "New Listing Created!");
//                     res.redirect(`/listings/${newListing._id}`);
//                 } catch (err) {
//                     next(err); // Pass errors to the error handler
//                 }
//             };




//  module.exports.createListing = async (req, res, next)=>{
//     let response = await geocodingClient.forwardGeocode({
//             query: req.body.listing.location,
//             limit: 1,
//           })
//             .send()  

//             if (!response.body.features.length) {
//                 req.flash("error", "Invalid location!");
//                 return res.redirect("/listings/new");
//             }

//          let url = req.file.path;
//          let filename = req.file.filename;
//          const newListing = new Listing(req.body.listing); 
//          newListing.owner = req.user._id;
//          newListing.image = {url, filename};     
//         // Map fixing
//          newListing.geometry = response.body.features[0].geometry;
//         // after listing is saved
//         let savedListing =  await newListing.save();   
//         console.log(savedListing);
//          req.flash("success", "New Listing created");
//          res.redirect("/listings");   
//      };
  
 
module.exports.renderNewForm = async (req, res) => {
        res.render("listings/new.ejs"); // Ensure you have "new.ejs" in "views/listings/"
    };
    

 module.exports.renderEditForm = async(req, res)=>{
    // From params extracting ID :
    let{id} = req.params; //extracting id
    const listing = await Listing.findById(id); //Based on Id we will be finding and diplaying the data in Home page  
    if(!listing){
        req.flash("error", "Listing You Requested Does Not Exists");
        res.redirect("/listings"); //Redirect to index page
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });   
    }





    module.exports.updateListing = async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findById(id);
    
        if (!listing) {
            req.flash("error", "Listing Not Found!");
            return res.redirect("/listings");
        }
    
        // Update basic details
        listing.set(req.body.listing);
    
        // If location is updated, get new coordinates
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
    
                listing.geometry = {
                    type: "Point",
                    coordinates: response.body.features[0].geometry.coordinates,
                };
            } catch (err) {
                console.error("Geocoding error:", err);
                req.flash("error", "Error fetching location coordinates.");
                return res.redirect(`/listings/${id}/edit`);
            }
        }
    
        // If a new image is uploaded, update it
        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
        }
    
        await listing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    };
    
    



// module.exports.updateListing = async(req, res)=>{
//     let{id} = req.params; //extracting id
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}); //updation with body happens here
// // if inside req. file exists ? then we cann upload
// // inside JS if need to check the Value is undefined or not ---> typeof
// if(typeof req.file !== "undefined"){
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = {url, filename};
//     await listing.save();
// }
//    req.flash("success", "Listing Updated!");
//    return res.redirect(`/listings/${id}`);
//    }





module.exports.destroyListing = async(req, res)=>{
    let{id} = req.params; //extracting id
    let deletedList = await Listing.findByIdAndDelete(id);
     console.log(deletedList);
     req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}