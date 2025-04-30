import mongoose from "mongoose";
import User from "../model/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface verifyUserPayload extends JwtPayload {
    _id: mongoose.Types.ObjectId;
    username: string;
}

const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        // get incoming refreshtoken can be by cookie , in header
        // verfity that is token creared by us or not -> if no not allowed
        const incomingAccessToken =
            req.headers.authorization?.replace("Bearer ", "") ||
            req.cookies?.accessToken;

        if (!incomingAccessToken) {
            throw new ApiError(
                401,
                "Unauthorized request , Access token missing"
            );
        }

        const decodeInfo = jwt.verify(
            incomingAccessToken,
            process.env.ACCESSTOKEN_KEY as string
        );

        if (!decodeInfo || typeof decodeInfo === "string") {
            throw new ApiError(
                401,
                "Unauthorized request , Invalaid Access token"
            );
        }
        const user = await User.findById(decodeInfo._id);
        if (!user) throw new ApiError(404, "User not found");

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Invalaid Access token");
    }
});

export { verifyUser };
