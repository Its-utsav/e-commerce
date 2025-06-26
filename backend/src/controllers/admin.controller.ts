import { Request, Response } from "express";
import mongoose, {
    AggregatePaginateResult,
    isValidObjectId,
    PaginateOptions,
    PipelineStage,
} from "mongoose";
import Cart from "../model/cart.model";
import Order from "../model/order.model";
import User, { UserDocument } from "../model/user.model";
import {
    updateRoleType,
    updateUserRoleZodSchema,
} from "../schemas/user.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { machine } from "node:os";

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
    const match: { [role: string]: string } = {};

    if (req.url.includes("merchant")) {
        match.role = "MERCHANT";
    } else if (req.url.includes("users")) {
        match.role = "USER";
    }

    const pipeline: PipelineStage[] = [
        // {
        //     $match: {
        //         role: "USER",
        //     },
        // },
        {
            $project: {
                password: 0,
                refreshToken: 0,
            },
        },
    ];

    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }
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
    const userId = req.params.id;

    if (!userId) {
        throw new ApiError(400, "User Id not provided");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id");
    }

    let role: string = "";
    if (req.url.includes("users")) role = "USER";
    else if (req.url.includes("merchant")) role = "MERCHANT";

    const user = await User.findOne({ _id: userId, role: role })
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
        throw new ApiError(
            400,
            "Admin cannot delete thier own account by using admin privileges, if you want to delete your account, login as admin user then send delete request"
        );
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
        // new role is same as previous one
        if (user.role === role) {
            throw new ApiError(400, "New Role is same as current role");
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

        const updatedUser = await User.findById(userId)
            .select("-password -refreshToken")
            .lean();

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

const deleteOrderByAdmin = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;

    if (!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order id");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
        throw new ApiError(
            400,
            "Cannot delete an order that is already delivered or cancelled"
        );
    }

    order.status = "CANCELLED";
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

const getAllOrdersDetails = asyncHandler(async (req, res) => {
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
    const orders = await Order.aggregatePaginate(
        Order.aggregate(pipeline),
        options
    );
    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, orders, "All orders fecthed successfully"));
});

export {
    deleteOrderByAdmin,
    deleteUser,
    getAllOrdersDetails,
    getAllUsers,
    getUserDeatils,
    updateUserRole,
};
