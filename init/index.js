const mongoose = require("mongoose");

const initData = require("./data.js");

// step : 9 : We are Going Through one Folder so one dot ./models enough
const Listing = require("../models/listing.js")



//step: 1 : To create a Data base named Wanderlust
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//step: 3 : calling Main Function
main().then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err);
})

//step: 2 :creating Main Function
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({}); // Clear existing data
  
    // ✅ Ensure 'owner' field is added before insertion
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: new mongoose.Types.ObjectId('679f07b22073171c6afd36e2') // Ensure it's stored as ObjectId
    }));
    
    await Listing.insertMany(initData.data); // Insert modified data
    console.log("Data was initialized");
  };
  
  initDB();
  