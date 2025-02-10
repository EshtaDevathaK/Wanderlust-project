

if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // Ensure this matches the ID of your map container
        style: "mapbox://styles/mapbox/streets-v12", // Map style
        center: coordinates, // Map center
        zoom: 5 // Initial zoom level
    });

    // Add a marker at the listing's location
    new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates)
        .addTo(map);
} else {
    console.error("Invalid coordinates format:", coordinates);
}





















// mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     style: "mapbox://styles/mapbox/streets-v12",
//     center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
//     zoom: 9 // starting zoom
// });


// const marker = new mapboxgl.Marker({ color: 'red'}) // New marker created
// .setLngLat(listing.geometry.coordinates) //This location of coordinates will be created   Listing.geometry.coordinates
// .addTo(map); // Added in map at the Top of this page code u can see map;
