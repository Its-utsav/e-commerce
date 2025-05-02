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
import mongoose from "mongoose";
import Cart from "../model/cart.model";
import Order from "../model/order.model";

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

    if (!product) {
        throw new ApiError(400, "Product does not exists");
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


// TODO COMPLETE BELOW HANDLERS
const getMerchantAllOrdersDetails = asyncHandler(
    async (req: Request, res: Response) => { }
);

const getMerchantOrdersDetails = asyncHandler(
    async (req: Request, res: Response) => { }
);

const updateOrderStatus = asyncHandler(
    async (req: Request, res: Response) => { }
);

export {
    createNewProduct,
    updateProductDetails,
    deleteProduct,
    getMerchantAllOrdersDetails,
    getMerchantOrdersDetails,
    updateOrderStatus,
};
