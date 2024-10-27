import { ApiError } from "../utils/apierror";
import { asyncHandeler } from "../utils/asynchandeler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandeler(async(req, _ , next) => {

try {
    const token = req.cookies?.accessToken || req.header("Authorisation" )?.replace("Bearer " , "")
    
    
    if(!token){
        throw new ApiError(401, "unauthorised request ")
    }
    const decodedToken = jwt.verify(token, process.env.ACSESS_TOKEN_SECRET)
    
    await User.findById(decodedToken?._id ).select(-password -refreshToken)
    
    if(!user ){
        throw new ApiError(401, "invalid user")
    }
    
    req.user = user;
    next()
} catch (error) {
    throw new ApiError(401, error?.message || "invalid")
}

})