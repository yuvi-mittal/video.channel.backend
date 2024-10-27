import { asyncHandeler } from "../utils/asynchandeler.js";
import {ApiError} from "../utils/apierror.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apirespone.js";
import jwt from "jsonwebtoken"
//import { JsonWebTokenError } from "jsonwebtoken";

const generateAccessTokenRefreshToken = async(userId)=> {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.refreshAccessToken()

        user.refreshToken = refreshToken

       await user.save({validateBeforeSave: false})  //saves the updated user document without triggering any additional validations

       return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, " ")
    }
}

const registerUser = asyncHandeler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    console.log("email: ", email);
    console.log("username" , username)

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
   // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
   // console.log(avatarLocalPath)

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

} )


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

    const user = await User.findOne({    // these methods are for mongoose 
        $or : [{username} ,{email}]   //either username or email in mongodb 
    }) 

    if(!user){
        throw new ApiError(400 , "user does not exist ")

    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404, "password is invlaid")
    }

    const {accessToken, refreshToken} = await generateAccessTokenRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

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

const logOutUser = asyncHandeler(async(req , res ) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    const options ={
        httpOnly : true,
        secure : true
       }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

    const refreshAccessToken = asyncHandeler(async(req,res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }

     try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if(!user){
      throw new ApiError(401 , "invalid refresh token")
  }
      if(incomingRefreshToken != user?.refreshToken){
          throw new ApiError(401 , "refresh token is expired")
      }
  
      const options ={
          httpOnly: true ,
          secure :false
      }
  
     const {accessToken, newrefreshToken} = await generateAccessTokenRefreshToken(user._id)
  
      return res 
      .status(200)
      .cookie("accessToken" , accessToken)
      .cookie("refreshToken" , newrefreshToken)
      .json(
          new ApiResponse(
              200,
              {accessToken, refreshToken: new newrefreshToken},
              "access token refreshed"
          )
      )
  } catch (error) {
    throw new ApiError(401 , "error")
  }
})

const changeCurrentPassword = asyncHandeler(async(req, res) =>{

    const {oldPassword , newPassword} = req.body

   const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

if(!isPasswordCorrect){
    throw new ApiError(401, "invalid old password")
}

    user.password= newPassword
   await user.save({validateBeforeSave: false })

   return res 
   .status(200)
   .json(new ApiResponse(200, {} , "password changed successfully "))

})

const getCurrentUser = asyncHandeler(async(req, res)=>{

    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails= asyncHandeler(async(req, res) =>{


    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(401, "all fields are req")
    }

   const user =  User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            fullName,
            email
        }
    },
    {new: true}
    ).select("-password")  //excluding the password field from the returned user object
    
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "account details updated successfully"))
})

// const updateAvatar = asyncHandeler(async(req, res) =>{

//    const avatarLocalPath = req.file?.path

//    if(!avatarLocalPath){
//     throw new ApiError(401, "file not found")
//    }


// })

// const updateImage = asyncHandeler(async(req, res) =>{

// })


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    
} 
