import { Request, Response } from "express";
import mongoose, {
    AggregatePaginateResult,
    isValidObjectId,
    PaginateOptions,
    PipelineStage,
    Types,
} from "mongoose";
import {} from "mongoose-aggregate-paginate-v2";
import Cart from "../model/cart.model";
import Order, { OrderDocument } from "../model/order.model";
import Product from "../model/product.model";
import {
    createOrder,
    createOrderInputZodSchema,
} from "../schemas/order.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
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
                throw error;
            }

            throw new ApiError(500, "Someting went wrong");
        } finally {
            await session.endSession();
        }
    }
);

const getOrderHistoryDetails = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;
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

        // my be use paginations
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    userId,
                },
            },
        ];
        const orders: AggregatePaginateResult<OrderDocument> =
            await Order.aggregatePaginate(Order.aggregate(pipeline), options);

        if (!orders || orders.docs.length === 0) {
            throw new ApiError(404, "No orders found");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    orders,
                    "Order history fecthed successfully"
                )
            );
    }
);

const getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    // orderId
    const userId = req.user?._id;
    const orderId = req.params.orderId;
    if (!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order Id");
    }

    // TODO -> after output testing ADD AS PER requirment
    const pipeline: PipelineStage[] = [
        {
            $match: {
                userId,
                _id: orderId,
            },
        },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "productDetails",
            },
        },
    ];
    const ordersOrderDocument = await Order.aggregate(pipeline);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                ordersOrderDocument,
                "Order details fetched successfully"
            )
        );
});

const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const orderId = req.params.orderId;
    if (!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order Id");
    }
    const orderDetails = await Order.findById(orderId);
    if (!orderDetails) {
        throw new ApiError(404, "No order found");
    }

    if (!req.baseUrl.includes("admin") && !(req.user?.role === "ADMIN")) {
        if (orderDetails?.userId.toString() !== userId?.toString()) {
            throw new ApiError(
                401,
                "Unauthorized : you cannot cacel this order"
            );
        }
    }

    if (orderDetails.status === "CANCELLED") {
        return res
            .status(200)
            .json(
                new ApiResponse(200, orderDetails, "Order is already cancelled")
            );
    }
    const session = await mongoose.startSession();
    const productIds = orderDetails.products.map((item) => item.productId);
    const products = await Product.find({
        _id: {
            $in: productIds,
        },
    })
        .select("stock")
        .lean();

    try {
        session.startTransaction();

        // restore the stock

        for (let item of products) {
            await Product.findByIdAndUpdate(
                item._id,
                {
                    $inc: {
                        stock: item.stock,
                    },
                },
                { session }
            );
        }
        orderDetails.status = "CANCELLED";
        await orderDetails?.save();
        await session.commitTransaction();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    orderDetails,
                    "Order successfully canceled"
                )
            );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error(`Error while cancel the order ${error}`);
        throw new ApiError(500, "Something went wrong while canceling order");
    } finally {
        await session.endSession();
    }
});

const makeAPayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const orderId = req.params.orderId;

    if (!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order Id");
    }

    const orderDetails = await Order.findById(orderId);

    if (orderDetails?.userId !== userId) {
        throw new ApiError(401, "You make payment of other's order");
    }
    const message = {
        m1: "You have successfully complete the dumy payment",
        m2: "LOL :)",
    };
    return res
        .status(200)
        .json(new ApiResponse(200, message, "Payment completed successfully"));
});

export {
    cancelOrder,
    getOrderDetails,
    getOrderHistoryDetails,
    makeAPayment,
    placeNewOrder,
};
