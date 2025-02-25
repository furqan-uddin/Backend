import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = User.findById(userId)
        const accessToken = generateAccessToken()
        const refreshToken = generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }

}

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
    // console.log("email ",email);

    if(
        [fullname,password,username,email].some( (field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required") 
    }
    if(!email.includes("@")) throw new ApiError(400,"In email @ sign is required") 
            
    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with same username or email exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImgLocalPath = req.files?.coverImage[0]?.path
    let coverImgLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImgLocalPath = req.files.coverImage[0].path
    }

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

const loginUser= asyncHandler(async(req,res) =>{
    // get details using req body
    // username or email
    // find the user
    // password check
    // access and refresh token 
    // send in cookies

    const {email,username,password} = req.body

    if(!username || !password){
        throw new ApiError(400,"username or password is required ")
    }

    const user = await User.findOne({
        $or : [{username},{email}]   //or mongoose operator
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(401,"Incorect Password")
    }

    const {refreshToken,accessToken} = generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true, //by doing this cokies are modifiable by server only 
        secure : true 
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser ,refreshToken ,accessToken
            },
            "user logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true, //by doing this cokies are modifiable by server only 
        secure : true 
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out successfully "))
})
export {
    registerUser,
    loginUser,
    logoutUser
}