import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/responseHandler.js";

const getAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something Went Wrong While Generating Refresh and Access Token")
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    //Get User Details from frontend ->req.body
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
    if (existOrNot) { throw new ApiError(409, "Email Or Username Already Exist") }

    //Step 4. check image and avatar uploaded or not..>>>

    // optional chaining Approach .........>>>>>>>>>
    //  const avatarLocalPath = req.files?.avatar?.path; 
    // const coverImageLocalPath = req.files?.coverImage?.path;

    // optional chaining Approach is working if field passed by the user in req.body or we can say req.files beause we used middleware multer for passing files. but if field not pass by the user in that case Error Occurs..for that reason take a Different Approach .....>>>>

    // Old School Approach if The codition are true pass the value in varible or else pass the null ....>>>>>>
    const avatarLocalPath = req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0 ? req.files.avatar[0].path : null
    const coverImageLocalPath = req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ? req.files.coverImage[0].path : null



    //Step 5. check the Avatar field..>>>
    if (!avatarLocalPath) { throw new ApiError(400, "Avatar is Required") }

    //Step 6.upload them at cloudinary..>>>
    const avatarUploded = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploded = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatarUploded);
    console.log(coverImageUploded);
    //Check Because avatar field Required in user Model
    if (!avatarUploded) { throw new ApiError(400, "Avatar is not uploaded in Cloud! Some Error Occur") }

    const user = await User.create({ username, fullName, email, password, avatar: avatarUploded.url, coverImage: coverImageUploded?.url || "", })

    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if (!userCreated) { throw new ApiError(500, "Something Went Wrong While Registering the User") }

    return res.status(201).json(new ApiResponse(200, userCreated, "User Created Successfully"))
})

export const logInUser = asyncHandler(async (req, res) => {
    // GET Data from User -> req.body
    // Username or email
    // find the user
    // password check
    // Access and refresh token

    // Step 1.GET Data from User -> req.body ....>>>>
    const { username, email, password } = req.body;

    // Step 2.Username or Email Required .....>>>>>
    if (!(username || email)) { throw new ApiError(401, "Username Or Email Required For LogIn") };

    // Step 3.find the user .....>>>>>
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) { throw new ApiError(402, "User Not Found") };

    // Step 4.password check ....>>>>
    const passwordMatched = await user.isPasswordCorrect(password);
    if (!passwordMatched) { throw new ApiError(404, "Your Password Is Wrong") }

    // Step 5.Get Access & Refresh Token ....>>>>>
    const { accessToken, refreshToken } = await getAccessTokenAndRefreshToken(user._id);

    //new access of User after Saving the refresh Token in User
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const optionForSequreCookies = { httpOnly: true, sequre: true };

    return res.status(200).cookie("refreshToken", refreshToken, optionForSequreCookies).cookie("accessToken", accessToken, optionForSequreCookies).json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "Log In Successfully"))
})

export const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });
    const optionForSequreCookies = { httpOnly: true, sequre: true };
    return res.status(200).clearCookie("refreshToken", optionForSequreCookies).clearCookie("accessToken", optionForSequreCookies).json(new ApiResponse(200, {}, "User Logged Out"))
})