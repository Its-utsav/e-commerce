import { isValidObjectId } from "mongoose";
import Cart from "../model/cart.model";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getCartDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const allCarts = await Cart.findById(userId);

    if (!allCarts) {
        throw new ApiError(404, "No carts found");
    }
    const cart: any = ""

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart details fetched successfully")
    )
});

const addProductToTheCart = asyncHandler(async (req, res) => { });
const updateProductQuanity = asyncHandler(async (req, res) => { });
const deleteProductFromCart = asyncHandler(async (req, res) => { });
const deleteCart = asyncHandler(async (req, res) => { });

export {
    getCartDetails,
    addProductToTheCart,
    updateProductQuanity,
    deleteCart,
    deleteProductFromCart,
};
