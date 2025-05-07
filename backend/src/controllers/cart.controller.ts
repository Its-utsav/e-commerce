import mongoose, { isValidObjectId } from "mongoose";
import Cart from "../model/cart.model";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Response, Request } from "express";
import {
    addItemInCart,
    addItemInToCartZodSchema,
    cartItem,
    cartItemZod,
} from "../schemas/cart.schema";

const getCartDetails = asyncHandler(async (req: Request, res: Response) => {
    // User is already loggdin
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }
    /* 
        - SOME PRODUCT INFO
        - SOME USER INFO 
    */
    const allCarts = await Cart.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: "products", // where
                localField: "products.productId", // my filed
                foreignField: "_id", // product collection -> _id
                as: "productInfo",
            },
        },
        {
            $unwind: "$productInfo",
        },
        {
            $lookup: {
                from: "user", // where
                localField: "products.sellerId", // my filed
                foreignField: "_id", // product collection -> _id
                as: "sellerInfo",
            },
        },
    ]);

    if (!allCarts || allCarts.length === 0) {
        throw new ApiError(404, "No carts found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allCarts[0],
                "Cart details fetched successfully"
            )
        );
});

/**
 * @description Add Product to the cart
 */
const addProductToTheCart = asyncHandler(
    async (req: Request<{}, {}, addItemInCart>, res: Response) => {
        // some basics checks
        // if user have a cart than the push the item into the cart
        // if user have no cart than create a cart and push item into the products array
        // return entire carts

        const zodStatus = addItemInToCartZodSchema.safeParse(req.body);

        if (!zodStatus.success) {
            const error = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        const { productId, quantity } = zodStatus.data;
        // check if their is any cart is available by the user or not ?
        // ------------  YES  ------------
        // Than push product into the products array
        // ------------- NO ----------------
        // Than push product into the products array by creating it,

        const userId = req.user?._id;
        const cartInfo = await Cart.findOne({ userId });

        if (cartInfo) {
            // CHECK for the duplicat product entry
            const existingProductInCart = cartInfo.products.findIndex(
                (item) => item.productId.toString() === productId
            );

            // -1 is truthy value than why i check
            if (existingProductInCart == -1) {
                cartInfo.products[existingProductInCart].quantity += quantity;
            } else {
                cartInfo.products.push({
                    productId: new mongoose.Types.ObjectId(productId),
                    quantity: quantity,
                });
            }
            const updatedCart = await cartInfo?.save(); // null check
            return res
                .status(200)
                .json(
                    new ApiResponse(200, updatedCart, "cart update sucessfully")
                );
        }
        // No cart
        const newCart = await Cart.create({
            userId,
            products: [
                {
                    productId: new mongoose.Types.ObjectId(productId),
                    quantity: quantity,
                },
            ],
        });

        if (!newCart) {
            throw new ApiError(500, "Internal server error");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, newCart, "Cart creaated successfully"));
    }
);

const updateProductQuanity = asyncHandler(async (req: Request<{}, {}, cartItem>, res: Response) => {
    // some basics checks
    // productid , qty
    // no product -> than just say no product
    // product in cart than -> update the qty

    const zodStatus = cartItemZod.safeParse(req.body);

    if (!zodStatus.success) {
        const error = zodStatus.error.errors
            .map((e) => e.message)
            .join(", ");
        throw new ApiError(400, error);
    }

    const userId = req.user?._id;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(400, "Their is no cart, so you cant't update it");
    }
    const { productId, quantity } = zodStatus.data;
    const productInCart = cart.products.findIndex((item) => item.productId.toString() === productId);
    if (productInCart == -1) {
        throw new ApiError(400, "Product not found it cart you have to add it first");
        // OR may be we can inject in req and redircet to add in cart route
    }

    // product in cart 
    // UPDATE IN QUANITY
    // MORE -> quantity -> 0 than remove it
    if (quantity == 0) { }

    cart.products[productInCart].quantity = quantity;
    const updatedCart = await cart.save();

    return res.status(200).json(
        new ApiResponse(200, updatedCart, "Product quanity update successfully")
    )
});


const deleteProductFromCart = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId;
    if (!productId) {
        throw new ApiError(400, "Product id is required");
    }

    if (!isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product id");
    }
    const userId = req.user?._id;
    const updatedCart = await Cart.updateOne({
        userId
    }, {
        $pull: {
            products: {
                productId: new mongoose.Types.ObjectId(productId)
            }
        }
    })

    if (updatedCart.modifiedCount === 0) {
        throw new ApiError(404, "Prodcut not found in cart");
    }
    return res.status(200).json(
        new ApiResponse(200, updatedCart, "Product deleted from cart successfully")
    )
});

const deleteCart = asyncHandler(async (req: Request, res: Response) => {
    // find and delete the cart 
    // no found no worry
    const userId = req.user?._id;
    const deletedCart = await Cart.findOneAndDelete(
        { userId }
    )
    if (!deletedCart) {
        throw new ApiError(404, "Cart not found");
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Cart deleted succesfully")
    )
});

export {
    getCartDetails,
    addProductToTheCart,
    updateProductQuanity,
    deleteCart,
    deleteProductFromCart,
};
