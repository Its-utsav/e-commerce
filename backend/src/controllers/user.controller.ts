import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../model/user.model";
import {
    createUser,
    createUserZodSchema,
    loginUser,
    loginUserZodSchema,
} from "../schemas/user.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import {
    cloudinaryUpload,
    deleteFromCloudinary,
    getPublicIdByUrl,
} from "../utils/cloudinary";
import { options } from "../constants";

const registerUser = asyncHandler(
    async (req: Request<{}, {}, createUser>, res: Response) => {
        const { username, email, password, role, address, avatarUrl } =
            req.body;

        const zodResult = createUserZodSchema.safeParse({
            username,
            email,
            password,
            role,
            address,
            avatarUrl,
        });

        // any data is missing than stop from here
        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        const data = zodResult.data;

        // find user by username or email
        const existingUser = await User.findOne({
            $or: [{ username: data.username }, { email: data.email }],
        });
        let findBy = "";

        if (existingUser) {
            if (existingUser.username === data.username) findBy = "username";
            if (existingUser.email === data.email) findBy = "email";
            throw new ApiError(400, `User already exists with ${findBy}`);
        }

        let uploadUrl: string;
        let publicId: string | undefined;

        if (req.file) {
            const uploadData = await cloudinaryUpload(req.file?.path);
            if (uploadData) {
                uploadUrl = uploadData.secure_url;

                publicId = getPublicIdByUrl(uploadUrl);
            }
        }
        const session = await mongoose.startSession();

        try {
            session.startTransaction();
            const createdUser = await User.create(
                [
                    {
                        username: data.username,
                        email: data.email,
                        avatarUrl: uploadUrl!,
                        password: data.password,
                        role: data.role,
                        address: data.address,
                    },
                ],
                { session }
            );
            if (!createdUser || createdUser.length === 0) {
                if (publicId) deleteFromCloudinary(publicId);
                throw new ApiError(500, "Faild to create user");
            }
            const userData = createdUser[0].toObject();

            const resUser = {
                username: userData.username,
                email: userData.email,
                role: userData.role,
                address: userData.address,
                avatarUrl: userData.avatarUrl,
            };
            session.commitTransaction();
            return res
                .status(201)
                .json(
                    new ApiResponse(201, resUser, "User successfully created")
                );
        } catch (error) {
            await session.abortTransaction();
            if (publicId) deleteFromCloudinary(publicId);
            throw new ApiError(500, "Failed to created user");
        } finally {
            await session.endSession();
        }
    }
);

const generateAccessAndRefreshToken = async (
    userId: mongoose.Types.ObjectId
) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(401, "User not found");
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: true });
        return { refreshToken, accessToken };
    } catch (error) {
        throw new ApiError(500, "Access and refresh token generation failed");
    }
};

const loginUser = asyncHandler(
    async (req: Request<{}, {}, loginUser>, res: Response) => {
        const { email, password } = req.body;

        const zodResult = loginUserZodSchema.safeParse({ email, password });

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }
        const data = zodResult.data;
        const existsUser = await User.findOne({ email: data.email });
        if (!existsUser) {
            throw new ApiError(404, "User does not exists");
        }

        const isPasswordCorrect = await existsUser.comparePassword(
            data.password
        );

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Unauthorized request , Invalid password");
        }

        // genrate access and refersh token

        const { refreshToken, accessToken } =
            await generateAccessAndRefreshToken(existsUser._id);

        // save into the cookie
        const user = existsUser.toObject();
        const userRes = {
            username: user.username,
            avatarUrl: user.avatarUrl,
            email: user.email,
            address: user.address,
            role: user.role,
        };
        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200, userRes, "User loggedin successfully"));
    }
);

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User log out successfully"));
});

export { registerUser, loginUser, logoutUser };
