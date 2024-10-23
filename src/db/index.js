import mongoose from "mongoose"
import {DB_NAME} from "../constants.js";

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);  //This gives you the hostname or IP address of the MongoDB server to which you are connected.
        //The connectionInstance is an instance of Mongoose.Connection. It holds information about the MongoDB connection
    } catch (error) {
        console.log("mongodb connection failed" , error)
        process.exit(1)  // This terminates the Node.js process with an exit code of 1, indicating that the process ended due to an error
    }
}

export default connectDB;