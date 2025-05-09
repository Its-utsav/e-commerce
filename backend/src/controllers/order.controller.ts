import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Order from "../model/order.model";
import { ApiResponse } from "../utils/ApiResponse";
import {
    createOrder,
    createOrderInputZodSchema,
} from "../schemas/order.schema";
import mongoose, { Types } from "mongoose";
import ApiError from "../utils/ApiError";
import Cart from "../model/cart.model";
import Product from "../model/product.model";

interface IProductItems {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
}
interface ICreateOrderData {
    userId: Types.ObjectId;
    products: IProductItems[];
    amount: number;
    paymentMethod: "UPI" | "COD" | "STRIPE" | "RAZORPAY";
    status: "PENDING" | "DELIVERED" | "CANCELLED";
}

const placeNewOrder = asyncHandler(
    async (req: Request<{}, {}, createOrder>, res: Response) => {
        // CART (PRODUCTS) -> ORDER
        // anything in cart AND WE GOT NOTHING -> it will became the order
        // If i recevied the productId and quantity -> than it will became our order

        const userId = req.user?._id;

        const zodStatus = createOrderInputZodSchema.safeParse(req.body);
        if (!zodStatus.success) {
            const error = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        const cleanOrderData = zodStatus.data; // clear data

        // actual item will store
        let orderItems: { productId: string; quantity: number }[];

        // NO INPUT -> cart products will be our orderItems
        // INPUT provided -> Recived Data will our orderItems
        if (
            !cleanOrderData ||
            !cleanOrderData.items ||
            cleanOrderData.items.length == 0
        ) {
            const userCart = await Cart.findOne({ userId });
            if (!userCart || !userCart.products || !userCart.products.length) {
                throw new ApiError(404, "No Cart items found");
            }

            // SOMETHING IN  CART
            orderItems = userCart.products.map((item) => {
                return {
                    productId: item.productId.toString(),
                    quantity: item.quantity,
                };
            });
        } else {
            // USE OF DATA
            orderItems = cleanOrderData.items;
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // store only products ids -> for easy retrieval of data by $in
            const productIds = orderItems.map((item) => item.productId);

            // find the stock , finalPrice of all given productId
            const productPriceAndStock = await Product.find({
                _id: { $in: productIds },
            })
                .select("stock finalPrice")
                .lean();

            // No price and stock found or length of price and stock array is not same as productIds array -> possiblity any id is worng

            if (
                !productPriceAndStock ||
                productPriceAndStock.length != productIds.length
            ) {
                throw new ApiError(404, "One or more product not found");
            }

            let productAmount = 0; // will calculate the total amount
            // array that will store the product ,quantity and price for order collection products field
            const orderProductItems: {
                productId: mongoose.Types.ObjectId;
                quantity: number;
                price: number;
            }[] = [];

            for (let item of orderItems) {
                // now iterate over each item in orderItems
                // check that productId of item is avaialbel in price and stock array
                const productDetails = productPriceAndStock.find(
                    (product) => product._id.toString() === item.productId
                );

                // Not found means we have no data of it
                if (!productDetails) {
                    throw new ApiError(
                        404,
                        `Product not found with ${item.productId} Id`
                    );
                }

                // check stock
                if (productDetails.stock < item.quantity) {
                    throw new ApiError(
                        404,
                        `Insufficent stock for name ${productDetails.name} ,Id ${productDetails._id}, Avaialabel stock ${productDetails.stock} but ${item.quantity} requsted`
                    );
                }

                // sufficent stock so price * quantity and store in Overall total amount
                productAmount += productDetails.finalPrice * item.quantity;

                // add necessary info in array 
                orderProductItems.push({
                    productId: new mongoose.Types.ObjectId(item.productId),
                    price: productDetails.finalPrice,
                    quantity: item.quantity,
                });
                // update the stock
                await Product.findByIdAndUpdate(
                    item.productId,
                    {
                        $inc: { stock: -item.quantity },
                    },
                    { session }
                );
            }

            const newOrder = await Order.create({
                userId,
                products: orderProductItems,
                amount: productAmount,
                paymentMethod: cleanOrderData.paymentMethod,
            });

            // - empty cart
            if (!cleanOrderData || cleanOrderData.items.length === 0) {
                const clearedCart = await Cart.findOneAndUpdate(
                    { userId },
                    {
                        $set: { products: [], quantity: 0 },
                    },
                    { session }
                );
                if (!clearedCart) {
                    console.warn("User's cart not found after placing order.");
                }
            }

            session.commitTransaction();
            return res
                .status(201)
                .json(
                    new ApiResponse(201, newOrder, "Order successfully placed")
                );
        } catch (error) {
            await session.abortTransaction();
            console.log("Error from placing new order ", error);

            if (error instanceof ApiError) {
                throw error
            }

            throw new ApiError(500, "Someting went wrong");
        } finally {
            await session.endSession();
        }
    }
);

const getOrderHistoryDetails = asyncHandler(
    async (req: Request, res: Response) => { }
);

const getOrderDetails = asyncHandler(async (req: Request, res: Response) => { });

const cancelOrder = asyncHandler(async (req: Request, res: Response) => { });

const makeAPayment = asyncHandler(async (req: Request, res: Response) => { });

export {
    placeNewOrder,
    getOrderDetails,
    cancelOrder,
    makeAPayment,
    getOrderHistoryDetails,
};
