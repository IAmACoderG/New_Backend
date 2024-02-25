import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/responseHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
    //Get User Details from frontend
    //validation - note Empty or Depands
    //check if user Already Exist ..from email and username or depends
    //check image and avatar uploaded or not
    //Avatar Required field in model
    //upload them at cloudinary
    //create user in object for entry in DB
    //remove password and token to response
    //check for creation
    //if created send response

    //Step 1.Get User Details from frontend..>>>
    const { username, fullName, email, password } = req.body;

    //Step 2.validation - note Empty or Depands..>>>
    if ([username, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field are Required")
    }

    //Step 3. Check if user Already Exist ..from email and username or depends..>>>
    const existOrNot = await User.findOne({ $or: [{ email }, { username }] });
    if (existOrNot) {
        throw new ApiError(409, "Email Or Username Already Exist")
    }

    //Step 4. check image and avatar uploaded or not..>>>
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    console.log(avatarLocalPath);
    console.log(coverImageLocalPath);

    //Step 5. check the Avatar field..>>>
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is Required")
    }

    //Step 6.upload them at cloudinary..>>>
    const avatarUploded = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploded = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatarUploded);
    console.log(coverImageUploded);
    //Check Because avatar field Required in user Model
    if (!avatarUploded) {
        throw new ApiError(400, "Avatar is not uploaded in Cloud! Some Error Occur")
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatarUploded.url,
        coverImage: coverImageUploded?.url || "",
    })

    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if (!userCreated) { throw new ApiError(500, "Something Went Wrong While Registering the User") }

    return res.status(201).json(new ApiResponse(200, userCreated, "User Created Successfully"))

})

