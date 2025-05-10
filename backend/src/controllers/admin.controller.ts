import mongoose, {
    AggregatePaginateResult,
    isValidObjectId,
    PaginateOptions,
    PipelineStage,
} from "mongoose";
import User, { UserDocument } from "../model/user.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import Cart from "../model/cart.model";
import Order from "../model/order.model";
import { Request, Response } from "express";
import {
    updateRoleType,
    updateUserRoleZodSchema,
} from "../schemas/user.schema";

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const sortQuery = req.query.sort as string;
    let sort: { [key: string]: 1 | -1 } = {};

    if (sortQuery) {
        const [sortFiled, sortOrder] = sortQuery.split(":");
        if (sortFiled && sortOrder) {
            sort = {
                [sortFiled]: sortOrder === "asc" ? 1 : -1,
            };
        }
    } else {
        sort = { createdAt: -1 };
    }

    const options: PaginateOptions = {
        page,
        limit,
        sort,
    };

    const pipeline: PipelineStage[] = [
        {
            $match: {},
        },
    ];

    const allUsers: AggregatePaginateResult<UserDocument> =
        await User.aggregatePaginate(User.aggregate(pipeline), options);

    if (!allUsers || allUsers.docs.length === 0) {
        throw new ApiError(404, "No Users found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, allUsers, "All User fetched successfully"));
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

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const admin = req.user;
    const adminId = admin?._id;

    if (!adminId || admin.role !== "ADMIN") {
        throw new ApiError(
            403,
            "Unauthorized access, only admin can delete the user"
        );
    }

    if (!userId) {
        throw new ApiError(400, "User Id not provided");
    }

    if (adminId.toString() === userId.toString()) {
        throw new ApiError(400, "Admin cannot delete thier own account");
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const cart = await Cart.findOneAndDelete({ userId }, { session });
        const order = await Order.deleteMany({ userId: userId }, { session });

        if (!cart) {
            console.warn("Failed to delete cart " + userId);
        }

        if (order.deletedCount > 0) {
            console.warn(`${order.deletedCount} orders deleted for ${userId}`);
        }

        const user = await User.findByIdAndDelete(userId, { session });

        if (!user) {
            await session.abortTransaction();
            throw new ApiError(404, "User not found");
        }

        console.log(`${admin._id} deleted ${user._id}`);

        await session.commitTransaction();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { deleteUserId: user._id },
                    "User deleted successfully"
                )
            );
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) throw error;
        new ApiError(500, "something went wrong while user deletion");
    } finally {
        await session.endSession();
    }
});

const updateUserRole = asyncHandler(
    async (req: Request<any, {}, updateRoleType>, res: Response) => {
        const userId = req.params.userId;
        const admin = req.user;
        if (!admin || admin.role !== "ADMIN") {
            throw new ApiError(401, "Unauthorized request");
        }
        const adminId = admin._id;

        if (userId === adminId.toString()) {
            throw new ApiError(403, "Admin cannot change its own role");
        }

        const zodStatus = updateUserRoleZodSchema.safeParse(req.body);

        if (!zodStatus.success) {
            const error = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        const { role } = zodStatus.data;
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        //   Became admin

        if (
            (user.role === "USER" || user.role === "MERCHANT") &&
            role === "ADMIN"
        ) {
            user.verifyBy = adminId;
            user.verifyAt = new Date();
            user.role = "ADMIN";
        }

        // became mercahnt

        if (user.role === "USER" && role === "MERCHANT") {
            user.verifyBy = adminId;
            user.verifyAt = new Date();
            user.role = "MERCHANT";
        }

        // back to normal

        if (
            (admin.role === "ADMIN" || admin.role === "MERCHANT") &&
            role === "USER"
        ) {
            delete user.verifyBy;
            delete user.verifyAt;
            user.role = "USER";
        }

        await user.save();

        const updatedUser = await User.findById(userId).select(
            "-password -refreshToken"
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedUser,
                    "User role updated successfully"
                )
            );
    }
);

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
