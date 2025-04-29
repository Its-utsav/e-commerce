import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../model/user.model";
import { createUser, createUserZodSchema } from "../schemas/user.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import {
    cloudinaryUpload,
    deleteFromCloudinary,
    getPublicIdByUrl,
} from "../utils/cloudinary";


export const registerUser = asyncHandler(
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
        console.log("existingUser", existingUser)
        if (existingUser) {
            if (existingUser.username === data.username) findBy = "username";
            if (existingUser.email === data.email) findBy = "email";
            throw new ApiError(400, `User already exists with ${findBy}`);
        }

        let uploadUrl: string;
        let publicId: string | undefined;
        console.log("file is", req.file);
        // TODO -> FIX UPLOAD ISSUE
        if (req.file) {
            const uploadData = await cloudinaryUpload(req.file?.path);
            if (uploadData) {
                console.log("file upload", uploadData);
                uploadUrl = uploadData.secure_url;
                console.log("upload url", uploadUrl);
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
