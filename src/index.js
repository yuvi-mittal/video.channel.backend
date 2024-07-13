import dotenv from "dotenv"
import mongoose from "mongoose";
//import {DB_NAME} from "./constants.js"
import {app} from './app.js'
import connectDB from "./db/index.js"
dotenv.config({
    path: './.env'
})

connectDB()

.then(() =>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`server is running on port : ${process.env.PORT}` );
    })
})
.catch((error) => {
    console.log("mongodb connection failed", error)
})



/*
import express from "express"

const app= express()

(async () =>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)  //Uses Mongoose to connect to a MongoDB database.
       app.on("error", () =>{
        console.log("error :" , error)
        throw error
       })

       app.listen(process.env.PORT, () =>{
        console.log(`app listening on port ${process.env.PORT}` );
       })
    } catch (error) {
        console.error("error :" , error)
        throw err
    }
})()
*/