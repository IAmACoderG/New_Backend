import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const jwtValidation = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) { throw new ApiError(404, "Authrization Failed") };
        const encodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(encodedToken._id).select("-password -refreshToken");
        if (!user) { throw new ApiError(405, "Invalid Access Token") };
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})