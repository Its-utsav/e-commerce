import { Request, Response } from "express";
import mongoose, { isValidObjectId, PipelineStage } from "mongoose";
import Cart from "../model/cart.model";
import Order from "../model/order.model";
import Product from "../model/product.model";
import {
    updateOrderStatusType,
    updateOrderStatusZodSchema,
} from "../schemas/order.schema";
import {
    createProductType,
    createProductZodSchema,
    searchProductByIdZodSchema,
    updateProductDetails,
    updateProductDetailsZodSchema,
} from "../schemas/product.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import {
    cloudinaryUploadMany,
    deleteFromCloudinary,
    getPublicIdByUrl,
} from "../utils/cloudinary";

const createNewProduct = asyncHandler(
    async (req: Request<{}, {}, createProductType>, res: Response) => {
        const zodResult = createProductZodSchema.safeParse(req.body);

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        let { name, price, stock, description, imageUrls, discount } =
            zodResult.data;
        // if files are given than upload it
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            const filePaths = files.map((file) => file.path);
            const urls = await cloudinaryUploadMany(filePaths);
            if (urls) imageUrls = urls;
        }

        const createdProduct = await Product.create({
            name,
            originalPrice: price,
            stock,
            description,
            imageUrls,
            discountInPercentage: discount,
            sellerId: req.user?._id,
        });

        if (!createdProduct) {
            throw new ApiError(
                500,
                "Unable to create product, intrenal server error"
            );
        }
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdProduct,
                    "product created succefully"
                )
            );
    }
);

const getMerchantProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const zodResult = searchProductByIdZodSchema.safeParse({ id: productId });
    // console.log(zodResult.data);

    if (!zodResult.success) {
        const error = zodResult.error.errors.map((e) => e.message).join(", ");
        throw new ApiError(400, error);
    }
    const { id } = zodResult.data;

    // we have to also need sellor informations

    const pipeline: PipelineStage[] = [
        {
            $match: {
                $and: [
                    {
                        _id: new mongoose.Types.ObjectId(id),
                    },
                    { sellerId: new mongoose.Types.ObjectId(req.user?._id) },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "sellerId",
                foreignField: "_id",
                as: "sellerInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatarUrl: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$sellerInfo",
        },
    ];

    const product = await Product.aggregate(pipeline);

    if (!product || product.length === 0) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                product[0],
                "Product Data fetched data successfully"
            )
        );
});

const updateProductDetails = asyncHandler(
    async (req: Request<any, {}, updateProductDetails>, res: Response) => {
        const zodResult = updateProductDetailsZodSchema.safeParse(req.body);

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }
        let { description, discount, price, name, stock } = zodResult.data;
        console.log(zodResult.data);
        const zodResultProductId = searchProductByIdZodSchema.safeParse({
            id: req.params.productId,
        });

        if (!zodResultProductId.success) {
            const error = zodResultProductId.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }

        const { id } = zodResultProductId.data;
        const product = await Product.findById(id);
        if (!product) {
            throw new ApiError(404, "Unable to find product");
        }
        const userId = req.user?._id;

        if (!req.baseUrl.includes("admin") && !(req.user?.role === "ADMIN")) {
            if (product.sellerId.toString() !== userId?.toString()) {
                throw new ApiError(
                    401,
                    "Unauthorized access , this product not belongs to you "
                );
            }
        }

        let updateStatus = false;

        // name
        if (name !== undefined && product.name !== name) {
            console.log("name not same", name);
            product.name = name;
            updateStatus = true;
        }

        // description
        if (description !== undefined && product.description !== description) {
            console.log("description not same");
            product.description = description;
            updateStatus = true;
        }

        // price

        if (price !== undefined && product.originalPrice !== price) {
            console.log("price not same");
            product.originalPrice = price;
            updateStatus = true;
        }

        // stock
        if (stock !== undefined && product.stock !== stock) {
            console.log("stock not same");
            product.stock = stock;
            updateStatus = true;
        }

        // discountInPercentage
        if (
            discount !== undefined &&
            product.discountInPercentage !== discount
        ) {
            console.log("discount not same");
            product.discountInPercentage = discount;
            updateStatus = true;
        }

        const oldUrls = product.imageUrls;
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            const filePaths = files.map((file) => file.path);
            const urls = await cloudinaryUploadMany(filePaths);
            if (urls) product.imageUrls = urls;
            updateStatus = true;
            // delete old images
            if (oldUrls !== undefined) {
                const publicIds = oldUrls.filter((oldUrl: string) =>
                    getPublicIdByUrl(oldUrl)
                );
                if (publicIds.length > 0) await deleteFromCloudinary(publicIds);
            }
        }
        if (!updateStatus) {
            return res
                .status(200)
                .json(
                    new ApiResponse(200, product, "Nothing to update product")
                );
        }
        await product.save({ validateBeforeSave: false });
        const updatedProduct = await Product.findById(id);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedProduct,
                    "Product successfully updated"
                )
            );
    }
);

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const zodResultProductId = searchProductByIdZodSchema.safeParse({
        id: req.params.productId,
    });

    if (!zodResultProductId.success) {
        const error = zodResultProductId.error.errors
            .map((e) => e.message)
            .join(", ");
        throw new ApiError(400, error);
    }
    const { id } = zodResultProductId.data;
    const sessions = await mongoose.startSession();
    const product = await Product.findById(id);

    const userId = req.user?._id;

    if (!product) {
        throw new ApiError(400, "Product does not exists");
    }

    if (!req.baseUrl.includes("admin") && !(req.user?.role === "ADMIN")) {
        if (product.sellerId.toString() !== userId?.toString()) {
            throw new ApiError(
                401,
                "Unauthorized access , this product not belongs to you "
            );
        }
    }

    try {
        sessions.startTransaction();
        // delete from cart , order , product
        // Delete from all carts
        await Cart.updateMany(
            {},
            {
                $pull: {
                    products: {
                        _id: id,
                    },
                },
            }
        ).session(sessions);

        // Delete from all Order whose status PENDING
        await Order.updateMany(
            {
                status: "PENDING",
            },
            {
                $pull: {
                    products: {
                        _id: id,
                    },
                },
            }
        ).session(sessions);
        const deleteProductRes =
            await Product.findByIdAndDelete(id).session(sessions);
        await sessions.commitTransaction();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Product successfully deleted"));
    } catch (error) {
        await sessions.abortTransaction();
        console.error("Error deleting product:", error);

        throw new ApiError(500, "Internal server error");
    } finally {
        await sessions.endSession();
    }
});

const getMerchantAllOrdersDetails = asyncHandler(
    async (req: Request, res: Response) => {
        // May be we can use pagination -> for better query
        // find the all order whose seller is current merchant

        // TODO FIX IT
        const allProductsId = await Product.find({ sellerId: req.user?._id })
            .select("_id")
            .lean();

        const productIds = allProductsId.map((p) => p._id);

        const orders = await Order.aggregate([
            {
                $match: {
                    "products.productId": {
                        $in: productIds,
                    },
                },
            },
            {
                $project: {
                    totalAmount: 1,
                    createdAt: 1,
                    // Filter only merchant's products from products array
                    products: {
                        $filter: {
                            input: "$products",
                            as: "item",
                            cond: { $in: ["$$item.productId", productIds] },
                        },
                    },
                },
            },
        ]);

        if (!orders || orders.length === 0) {
            throw new ApiError(404, "No orders found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, orders, "All order fetched succesfully")
            );
    }
);

const getMerchantOrdersDetails = asyncHandler(
    async (req: Request, res: Response) => {
        throw new ApiError(404, "this service is unable :(");
        if (!isValidObjectId(req.params.orderId)) {
            throw new ApiError(400, "Invalid order id");
        }
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError(404, "Unable to find order");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    order,
                    "Order details fetched successfully"
                )
            );
    }
);

const updateOrderStatus = asyncHandler(
    async (req: Request<any, {}, updateOrderStatusType>, res: Response) => {
        console.log(req.body);
        const zodResult = updateOrderStatusZodSchema.safeParse(req.body);

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }
        if (!isValidObjectId(req.params.orderId)) {
            throw new ApiError(400, "Invalid order id");
        }
        const orderId = req.params.orderId;
        // find the order -> whose seller is current merchant
        // -> update in proggress directions
        const allProductsId = await Product.find({ sellerId: req.user?._id })
            .select("_id")
            .lean();
        const order = await Order.findOne({
            _id: new mongoose.Types.ObjectId(orderId),
            "products.productId": {
                $in: allProductsId,
            },
        });
        console.log(order);
        if (!order) {
            throw new ApiError(400, "Unable to find order");
        }

        if (order.paymentStatus === "PENDING") {
            throw new ApiError(400, "Payment panding .");
        }

        if (order.status === "CANCELLED") {
            throw new ApiError(400, "cancelled order can not be updated");
        }
        const { status } = zodResult.data;

        // "PENDING" -> "DELIVERED"
        // "CANCELLED"

        if (
            order.status === "PENDING" &&
            status !== "PENDING" &&
            status !== "CANCELLED"
        ) {
            order.status = status; // DELIVERED
        }

        await order.save({ validateBeforeSave: false });

        const updateOrder = await Order.findOne({
            _id: new mongoose.Types.ObjectId(orderId),
            products: {
                _id: req.user?._id,
            },
        }).lean();

        return res
            .status(200)
            .json(
                new ApiResponse(200, updateOrder, "Order update successfully")
            );
    }
);

export {
    createNewProduct,
    deleteProduct,
    getMerchantAllOrdersDetails,
    getMerchantOrdersDetails,
    updateOrderStatus,
    updateProductDetails,
    getMerchantProduct,
};
