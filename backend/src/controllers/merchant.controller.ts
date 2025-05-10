import { Response, Request } from "express";
import asyncHandler from "../utils/asyncHandler";
import {
    createProductType,
    createProductZodSchema,
    updateProductDetailsZodSchema,
    updateProductDetails,
    searchProductByIdZodSchema,
} from "../schemas/product.schema";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import {
    cloudinaryUploadMany,
    deleteFromCloudinary,
    getPublicIdByUrl,
} from "../utils/cloudinary";
import Product from "../model/product.model";
import mongoose, { isValidObjectId } from "mongoose";
import Cart from "../model/cart.model";
import Order from "../model/order.model";
import {
    updateOrderStatusType,
    updateOrderStatusZodSchema,
} from "../schemas/order.schema";

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

const updateProductDetails = asyncHandler(
    async (req: Request<any, {}, updateProductDetails>, res: Response) => {
        const zodResult = updateProductDetailsZodSchema.safeParse(req.body);

        if (!zodResult.success) {
            const error = zodResult.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, error);
        }
        let { description, discount, price, name, stock, imageUrls } =
            zodResult.data;

        const zodResultProductId = searchProductByIdZodSchema.safeParse(
            req.params.productId
        );

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
            product.name = name;
            updateStatus = true;
        }

        // description
        if (description !== undefined && product.description !== description) {
            product.description = description;
            updateStatus = true;
        }

        // price

        if (price !== undefined && product.originalPrice !== price) {
            product.originalPrice = price;
            updateStatus = true;
        }

        // stock
        if (stock !== undefined && product.stock !== stock) {
            product.stock = stock;
            updateStatus = true;
        }

        // discountInPercentage
        if (
            discount !== undefined &&
            product.discountInPercentage !== discount
        ) {
            product.discountInPercentage = discount;
            updateStatus = true;
        }

        const oldUrls = product.imageUrls;
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            const filePaths = files.map((file) => file.path);
            const urls = await cloudinaryUploadMany(filePaths);
            if (urls) product.imageUrls = urls;
            // delete old images
            if (oldUrls !== undefined) {
                const publicIds = oldUrls.filter((oldUrl: string) =>
                    getPublicIdByUrl(oldUrl)
                );
                await deleteFromCloudinary(publicIds);
            }
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
    const zodResultProductId = searchProductByIdZodSchema.safeParse(
        req.params.productId
    );

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
        const orders = await Order.find({
            products: {
                $elemMatch: {
                    _id: req.user?._id,
                },
            },
        });

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
        const order = await Order.findOne({
            _id: new mongoose.Types.ObjectId(orderId),
            products: {
                $elemMatch: {
                    _id: req.user?._id,
                },
            },
        });

        if (!order) {
            throw new ApiError(400, "Unable to find order");
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
    updateProductDetails,
    deleteProduct,
    getMerchantAllOrdersDetails,
    getMerchantOrdersDetails,
    updateOrderStatus,
};
