import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res) => {
    // get user details from frontend
    // validations - ex not empty
    // check if user already exists :check using username, email
    // check for images , check for avatar - required
    // upload them to cloudinary , avatar
    // create user object - create entry in db 
    // remove passsword and refresh token field from response 
    // check for user creation
    // return res 


    const {username,fullname,email,password} = req.body
    console.log("email ",email);

    if(
        [fullname,password,username,email].some( (field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required") 
    }
    if(!email.includes("@")) throw new ApiError(400,"In email @ sign is required") 
            
    const existedUser = User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with same username or email exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImgLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImgLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrogn when registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )
    // res.status(200).json({
    //     message : "ok"
    // })
})

export {registerUser}