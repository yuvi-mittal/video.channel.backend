import { asyncHandeler } from "../utils/asynchandeler.js";
import {ApiError} from "../utils/apierror.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apirespone.js";

const generateAccessTokenRefreshToken = async(userId)=> {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.refreshAccessToken()

        user.refreshToken = refreshToken

       await user.save({validateBeforeSave: false})

       return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, " ")
    }
}
const registerUser = asyncHandeler(async(req,res) => {

    
    const {fullName, email, username, password } = req.body
    console.log("email: ", email);
    console.log(username



    )

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    // res.status(200).json({
    //     message: "ok"
    // })
})

const loginUser = asyncHandeler(async(req , res) =>{
    // data from req body 
    // access through email or username 
    //find the user 
    // if exists check password 
    // access and refresh toke 
    // send cookies 

    const {username, email, password} =req.body 

    if(!(username || email)){
        throw new ApiError(400 , "username or email is required ")
    }

    const user = await User.findOne({    // these methods are fom mongoose 
        $or : [{username} ,{email}]   //either username or email in mongodb 
    }) 

    if(!user){
        throw new ApiError(404 , "user does not exist ")

    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404, "password is invlaid")
    }

    const {accessToken, refreshToken} = await generateAccessTokenRefreshToken(user._id)

   const loggedInUser =  User.findById(user._id).select("-password -refreshToken")

   const options ={
    httpOnly : true,
    secure : true
   }

   return res.status(200)
   .cookie("accessToken" , accessToken, options)
   .cookie("refreshToken" , refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
            user : loggedInUser, accessToken, refreshToken
        }, 
        "user logged in succesfully "
    )
   )
})

const logOut = asyncHandeler(async(req , res ) => {
    

})

export {
    registerUser,
    loginUser
} 
