import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import { options } from "../constants";
import Cart from "../model/cart.model";
import Order from "../model/order.model";
import User from "../model/user.model";
import {
    createUser,
    createUserZodSchema,
    loginUser,
    loginUserZodSchema,
    updatedUser,
    updatePassword,
    updatePasswordZodSchema,
    updateUserZodSchema,
} from "../schemas/user.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import {
    cloudinaryUpload,
    deleteFromCloudinary,
    getPublicIdByUrl,
} from "../utils/cloudinary";

const registerUser = asyncHandler(
    async (req: Request<{}, {}, createUser>, res: Response) => {
        const zodResult = createUserZodSchema.safeParse(req.body);

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
            await session.commitTransaction();
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
            return res
                .status(201)
                .json(
                    new ApiResponse(201, resUser, "User successfully created")
                );
        } catch (error) {
            console.error("Failed to create user " + error);
            await session.abortTransaction();
            if (publicId) await deleteFromCloudinary(publicId);
            throw new ApiError(500, "Failed to created user");
        } finally {
            session.endSession();
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
        user.save({ validateBeforeSave: false });
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
    if (!userId) {
        throw new ApiError(401, "User Id not provided");
    }
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

const refreshAccessTokenViaRefreshToken = asyncHandler(async (req, res) => {
    try {
        // get incoming refreshtoken can be by cookie , in header
        // verfity that is token creared by us or not -> if no not allowed
        const incomingRefreshToken =
            req.headers.authorization?.replace("Bearer ", "") ||
            req.cookies?.refreshToken ||
            req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(
                401,
                "Unauthorized request , Refresh token missing"
            );
        }

        const decodeInfo = jwt.verify(
            incomingRefreshToken,
            process.env.REFERESHTOKEN_KEY as string
        );

        if (!decodeInfo || typeof decodeInfo === "string") {
            throw new ApiError(
                401,
                "Unauthorized request , Invalaid Refresh token"
            );
        }
        const user = await User.findById(decodeInfo._id);
        if (!user) throw new ApiError(404, "User not found");

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is used Or Expiers");
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            refreshToken,
        })
            .select("-password -refreshToken")
            .lean();

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    updatedUser,
                    "Refresh token successfully refresh"
                )
            );
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Invalaid Refresh token");
    }
});

const getUserInfo = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "User Id not provided");
    }
    const user = await User.findById(userId)
        .select("-password -refreshToken")
        .lean();
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User data fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User Id not provided");
    }
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const cart = await Cart.findOneAndDelete({ userId }, { session });
        const order = await Order.deleteMany({ userId: userId }, { session });
        if (!cart) {
            console.warn("Failed to delete cart for userId " + userId);
        }

        if (order.deletedCount > 0) {
            console.warn(`${order.deletedCount} orders deleted for ${userId}`);
        }

        const user = await User.findByIdAndDelete(userId, { session });
        if (!user) {
            await session.abortTransaction();
            throw new ApiError(404, "User not found");
        }
        await session.commitTransaction();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "User deleted successfully"));
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) throw error;
        new ApiError(500, "something went wrong while user deletion");
    } finally {
        await session.endSession();
    }
});

const updateUser = asyncHandler(
    async (req: Request<{}, {}, updatedUser>, res: Response) => {
        const { address, avatarUrl } = req.body;

        const zodResult = updateUserZodSchema.safeParse({
            address,
            avatarUrl,
        });

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }
        const data = zodResult.data;
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(401, "User Id not provided");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        let updateStatus = false;

        // Previous their is no address OR Previous address is not same as current one
        if (
            (data.address !== undefined && data.address !== user.address) ||
            (user.address === undefined && data.address !== undefined)
        ) {
            user.address = data.address;
            updateStatus = true;
        }

        // avatar got
        let uploadUrl;
        if (req.file) {
            const uploadData = await cloudinaryUpload(req.file?.path);
            if (uploadData) {
                uploadUrl = uploadData.secure_url;
                user.avatarUrl = uploadUrl;
                updateStatus = true;
            } else {
                throw new ApiError(500, "Avatar upload failed");
            }
        }

        if (!updateStatus) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Nothing to update"));
        }
        const updatedData = await user.save({ validateBeforeSave: true });
        const userRes = {
            username: updatedData.username,
            email: updatedData.email,
            avatarUrl: updatedData.avatarUrl,
            address: updatedData.address,
            role: updatedData.role,
        };

        return res
            .status(200)
            .json(new ApiResponse(200, userRes, "User updated successfully"));
    }
);

const changePassword = asyncHandler(
    async (req: Request<{}, {}, updatePassword>, res) => {
        // old password (from DB) == old password  (user)
        // update password
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(401, "User Id not provided");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        console.log(req.body);
        const { oldPassword, newPassword } = req.body;
        const zodResult = updatePasswordZodSchema.safeParse({
            oldPassword,
            newPassword,
        });

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }
        const data = zodResult.data;

        const oldPasswordCheckRes = await user.comparePassword(
            data.oldPassword
        );

        if (!oldPasswordCheckRes) {
            throw new ApiError(
                401,
                "Unauthorized request , Invalid old password"
            );
        }

        const isNewPasswordSame = await user.comparePassword(data.newPassword);

        if (isNewPasswordSame) {
            throw new ApiError(400, "New password is same as old password");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "User password change successfully")
            );
    }
);

const getOrderHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Object id");
    }

    const orders = await Order.find({ userId: userId });
    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No Orders found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, orders, "Orders history fetched successfully")
        );
});

export {
    changePassword,
    deleteUser,
    getOrderHistory,
    getUserInfo,
    loginUser,
    logoutUser,
    refreshAccessTokenViaRefreshToken,
    registerUser,
    updateUser,
};
