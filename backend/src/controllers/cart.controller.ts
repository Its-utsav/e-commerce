import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import Cart from "../model/cart.model";
import Product from "../model/product.model";
import {
    addItemInCart,
    addItemInToCartZodSchema,
    cartItem,
    cartItemZod,
} from "../schemas/cart.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getCartDetails = asyncHandler(async (req: Request, res: Response) => {
    // User is already loggdin
    const userId = req.user?._id;
    /* 
        - SOME PRODUCT INFO
        - SOME USER INFO 
        TODO -> fix response
    */
    const allCarts = await Cart.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "products",
            },
        },
        // {
        //     $unwind: "$products",
        // },
        {
            $project: {
                _id: 1,
                amount: 1,
                userId: 1,
                totalItems: 1,
                products: {
                    $map: {
                        input: "$products",
                        as: "product",
                        in: {
                            _id: "$$product._id",
                            name: "$$product.name",
                            description: "$$product.description",
                            originalPrice: "$$product.originalPrice",
                            stock: "$$product.stock",
                            discountInPercentage:
                                "$$product.discountInPercentage",
                            discountInPrice: "$$product.discountInPrice",
                            finalPrice: "$$product.finalPrice",
                            img: {
                                $arrayElemAt: ["$$product.imageUrls", 0],
                            },
                        },
                    },
                },
            },
        },

        // {
        //     $lookup: {
        //         from: "products", // where
        //         localField: "products.productId", // my filed
        //         foreignField: "_id", // product collection -> _id
        //         as: "productInfo",
        //         // pipeline: [
        //         //     {
        //         //         $project: {
        //         //             _id: 1,
        //         //             finalPrice: 1,
        //         //             originalPrice: 1,
        //         //             description: 1,
        //         //             imageUrls: 1,
        //         //             name: 1,
        //         //             sellerId: 1,
        //         //         },
        //         //     },
        //         // ],
        //     },
        // },
        // {
        //     $unwind: "$productInfo",
        // },
        // {
        //     $lookup: {
        //         from: "user", // where
        //         localField: "productInfo.sellerId", // my filed
        //         foreignField: "_id", // product collection -> _id
        //         as: "sellerInfo",
        //     },
        // },
    ]);

    if (!allCarts || allCarts.length === 0) {
        throw new ApiError(404, "No carts found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, allCarts, "Cart details fetched successfully")
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
        if (!productId || !quantity) {
            throw new ApiError(400, "productId and quantity both required");
        }

        if (!isValidObjectId(productId)) {
            throw new ApiError(400, "Invalid productId");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(
                404,
                "No Product found , possibly invalid product id"
            );
        }

        // check if their is any cart is available by the user or not ?
        // ------------  YES  ------------
        // Than push product into the products array
        // ------------- NO ----------------
        // Than push product into the products array by creating it,

        const userId = req.user?._id;
        const cartInfo = await Cart.findOne({ userId });

        // NO cart
        if (!cartInfo) {
            // console.log("Not in cart");

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
                .json(
                    new ApiResponse(201, newCart, "Cart created successfully")
                );
        }

        // CHECK for the duplicat product entry
        // index for if product in already in cart
        // -1 if not -> we have to add to product in cart
        const existingProductInCart = cartInfo.products.findIndex(
            (item) => item.productId.toString() === productId
        );

        // console.log("Already in cart", cartInfo, existingProductInCart);
        let updatedCart;
        // -1 is truthy value than why i check
        if (existingProductInCart == -1) {
            // Not in cart product
            updatedCart = await Cart.findOneAndUpdate(
                { userId: userId },
                {
                    $push: {
                        products: {
                            productId: new mongoose.Types.ObjectId(productId),
                            quantity,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        } else {
            // Already in cart
            updatedCart = await Cart.findOneAndUpdate(
                { userId: userId, "products.productId": productId },
                {
                    $set: {
                        "products.$.quantity": quantity,
                    },
                },
                {
                    new: true,
                }
            );
        }

        if (!updatedCart) {
            throw new ApiError(500, "Failed to update cart");
        }

        // If work , don't touch it

        updatedCart.calculateTotalAndUpdateQuantity();
        updatedCart.totalItems = updatedCart.products.length;
        await updatedCart.save(); // Save changes

        return res
            .status(200)
            .json(new ApiResponse(200, updatedCart, "cart update sucessfully"));
    }
);

const updateProductQuanity = asyncHandler(
    async (req: Request<{}, {}, cartItem>, res: Response) => {
        // some basics checks
        // productid , qty
        // no product -> than just say no product
        // product in cart than -> update the qty

        const zodStatus = cartItemZod.safeParse(req.body);

        if (!zodStatus.success) {
            console.log(req.body);
            const error = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        const userId = req.user?._id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new ApiError(
                400,
                "Their is no cart, so you cant't update it"
            );
        }
        const { productId, quantity } = zodStatus.data;
        const productInCart = cart.products.findIndex(
            (item) => item.productId.toString() === productId
        );
        if (productInCart == -1) {
            throw new ApiError(
                400,
                "Product not found it cart you have to add it first"
            );
            // OR may be we can inject in req and redircet to add in cart route
        }

        // product in cart
        // UPDATE IN QUANITY
        // MORE -> quantity -> 0 than remove it

        cart.products[productInCart].quantity = quantity;
        const updatedCart = await cart.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedCart,
                    "Product quanity update successfully"
                )
            );
    }
);

const deleteProductFromCart = asyncHandler(
    async (req: Request, res: Response) => {
        const productId = req.params.productId;
        if (!productId) {
            throw new ApiError(400, "Product id is required");
        }

        if (!isValidObjectId(productId)) {
            throw new ApiError(400, "Invalid product id");
        }
        const userId = req.user?._id;
        const updatedCart = await Cart.updateOne(
            {
                userId,
            },
            {
                $pull: {
                    products: {
                        productId: new mongoose.Types.ObjectId(productId),
                    },
                },
            }
        );
        if (updatedCart.modifiedCount === 0) {
            throw new ApiError(404, "Product not found in cart");
        }
        const cart = await Cart.findOne({ userId });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cart,
                    "Product deleted from cart successfully"
                )
            );
    }
);

const deleteCart = asyncHandler(async (req: Request, res: Response) => {
    // find and delete the cart
    // no found no worry
    const userId = req.user?._id;
    const deletedCart = await Cart.findOneAndDelete({ userId });
    if (!deletedCart) {
        throw new ApiError(404, "Cart not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Cart deleted succesfully"));
});

export {
    addProductToTheCart,
    deleteCart,
    deleteProductFromCart,
    getCartDetails,
    updateProductQuanity,
};
