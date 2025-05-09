import { isValidObjectId } from "mongoose";
import User from "../model/user.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getAllUsers = asyncHandler(async (req, res) => {
    // In filter condition add merchant condition
    // if base url include merchant than
});

const getUserDeatils = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        throw new ApiError(400, "User Id not provided");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id");
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

const deleteUser = asyncHandler(async (req, res) => {});

const updateUserRole = asyncHandler(async (req, res) => {});

const updateProduct = asyncHandler(async (req, res) => {});

const deleteProduct = asyncHandler(async (req, res) => {});

const deleteOrder = asyncHandler(async (req, res) => {});

export {
    getAllUsers,
    getUserDeatils,
    deleteUser,
    updateUserRole,
    updateProduct,
    deleteProduct,
    deleteOrder,
};
