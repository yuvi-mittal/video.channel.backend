import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const subscriptionSchema = new Schema({

    subscriber:{
        type: Schema.Types.ObjectId,   
        ref : "User"
    },
    channel:{
        type: Schema.Types.ObjectId,   
        ref : "User"
    }

},{timestamps: true})


export const subscription = mongoose.model("subscription" , subscriptionSchema)