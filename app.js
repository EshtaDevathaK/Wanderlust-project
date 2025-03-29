import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import methodOverride from "method-override";
import ejsMate from "ejs-mate";
import ExpressError from "./utils/ExpressError.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import User from "./models/user.js";
import listingRouter from "./routes/listing.js";
import reviewRouter from "./routes/review.js";
import userRouter from "./routes/user.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection
const dbUrl = process.env.ATLASDB_URL;
mongoose.connect(dbUrl)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

const app = express();

// Set up view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global flash and user middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

// Routes
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// 404 Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found Buddy I am Sorry!!.."));
});

// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!.." } = err;
  console.error("🔥 Error Middleware Caught:", err);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is listening on Port: 8080");
});





















// // Using this Under Development Phase Not Under Production Phase
// // ## Means That When We deploy ( Hoisting ) / Upload in GitHub should not Upload .env file (SECRET Credentials)
// if(process.env.NODE_ENV != "production"){
//     // To get Access Of  .env file
// require("dotenv").config();
// }


// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");

// const session = require("express-session");
// // connect-mongo
// const MongoStore = require("connect-mongo");


// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");

// // Routes Folder Directing
// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");




// // Your MongoDB connection code in app.js
// //const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// const dbUrl = process.env.ATLASDB_URL;


// main()
// .then(()=>{
//     console.log("Connected to DB");
// })
// .catch((err)=>{
//     console.log(err);
// })

// async function main(){
//     await mongoose.connect(dbUrl);
// }
        


// //step : 12 : after setting index.ejs :
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride("_method"));
// app.engine('ejs', ejsMate);


// // To use static files in app.js
// app.use(express.static(path.join(__dirname, "/public")));


// const store = MongoStore.create({
//     mongoUrl :  dbUrl,
//     crypto: {
//      secret: process.env.SECRET,
//     },
//     touchAfter: 24 * 3600, 
//  });

// store.on("error", ()=>{
//     console.log("ERROR IN MONGO SESSION STORE", err);
// });

// // middleWare -- Start point
// const sessionOptions = {
//     store,
//     secret : process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { 
//         // 7 days , 24 hrs, 60 mins, 60 secs, 1000 MilliSeconds
//         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true, //Cross Scripting Attacks
//     }
// };


// // app.get("/", (req, res)=>{
// //     res.send("Hi, i am root");
// // });





// // Tracking Whether Our Sessions Are Working Properly;
// app.use(session(sessionOptions)); // middleWare -- continuation point
// app.use(flash());

// app.use(passport.initialize()); // middleWare initializes the passport
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



// // Middleware for Flash Messages
// app.use((req, res, next)=>{

// res.locals.success = req.flash("success"); // if any sccess mssg appears 
// res.locals.error = req.flash("error");
// res.locals.currUser = req.user || null;
// next();  // Calls To next 
// })


// // ✅ Place routes **before** the error handler
// app.use("/", userRouter);  // ✅ Moved ABOVE error handling middleware
// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);




// // Common error Handler For all
// app.all("*", (req, res, next)=>{
//     next (new ExpressError(404, "Page Not found Buddy I am Sorry!!.."))
//     });

// // MIDDLE WARE :
// app.use((err, req, res, next)=>{
//     let{ statusCode = 500, message = "Something Went Wrong!.." } = err;
//     res.status(statusCode).render("error.ejs", {message});
// //  res.status(statusCode).send(message);
// });
    


// // Global Error Handling for Uncaught Errors
// process.on("uncaughtException", (err) => {
//     console.error("🔥 Uncaught Exception:", err);
//     process.exit(1); // Exit the server (prevents zombie processes)
// });

// process.on("unhandledRejection", (err) => {
//     console.error("🔥 Unhandled Promise Rejection:", err);
// });

// // Gracefully Handle Server Errors
// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something Went Wrong!.." } = err;
//     console.error("🔥 Error Middleware Caught:", err);
//     res.status(statusCode).render("error.ejs", { message });
// });



// app.listen(8080, ()=>{
//     console.log("Server is listening to  Port : 8080");
// });




















