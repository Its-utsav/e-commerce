import { Request, Response } from "express";
import Product, { ProductDocument } from "../model/product.model";
import {
    productFindQueryZodSchema,
    productFindQuery,
    searchProductById,
    searchProductByIdZodSchema,
} from "../schemas/product.schema";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import mongoose, {
    Aggregate,
    AggregatePaginateResult,
    PaginateOptions,
    PipelineStage,
} from "mongoose";

const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    // 1. Validates the query
    const zodResult = productFindQueryZodSchema.safeParse(req.query);
    if (!zodResult.success) {
        const error = zodResult.error.errors.map((e) => e.message).join(", ");
        throw new ApiError(400, error);
    }
    const queryParameters: productFindQuery = zodResult.data;
    const { page, maxPrice, minPrice, limit, sortBy, search } = queryParameters;
    // 2. build pipeline
    const pipeline: PipelineStage[] = [];

    // --------- FILTERING ---------
    const match: { [key: string]: any } = {}; // keys are string but values can be anything

    // F0 --------- RE-USE for merchant --------

    if (
        req.user &&
        req.user.role === "MERCHANT" &&
        req.baseUrl.includes("/merchant")
    ) {
        match.sellerId = req.user._id;
    }

    // F1 ---- Based on search ----
    // (Might be user want to search by product name or have some little info about product description) query
    if (search) {
        match.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    // F2 ------- Based on price -------

    // min or max price required
    // Min price -> than get those product whose price is >= the Min price
    // Suppose minPrice = 500
    // Get the all products whose price is 500 or more

    // Max price -> than get those product whose price is <= the max price
    // Suppose maxPrice =  1000
    // Get all products whose price is less than 1000
    // maxPrice < , minPrice >

    if (minPrice !== undefined || maxPrice !== undefined) {
        match.price = {};
        // if minprice -> > minprice
        if (minPrice !== undefined) {
            match.price.$gte = minPrice;
        }
        // if maxprice -> < maxprice
        if (maxPrice !== undefined) {
            match.price.$lte = maxPrice;
        }
    }

    // If search query OR price filter exist than only add to actual pipeline

    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    // ----- SORTING -----
    // May be user send query with sortBy ->
    // in MongoDB we have $sort
    // 1 -> ascending
    // -1 -> descending
    // price -> ?sortBy=price:asc

    const sort: { [key: string]: 1 | -1 } = {}; // sortBy -> price , stock , name
    const [sortField, sortOrder] = sortBy.split(":"); // price:asc  -> ['price','asc' ]

    const allowedSortFields = ["createdAt", "price", "name", "stock"]; // allowed fileds

    if (allowedSortFields.includes(sortField)) {
        sort[sortField] = sortOrder === "asc" ? 1 : -1;
    } else {
        // if sortField not matched in allowedSortFields
        sort.createdAt = -1;
    }

    pipeline.push({ $sort: sort });

    const options: PaginateOptions = {
        page: page,
        limit: limit,
        customLabels: {
            docs: "products",
            totalDocs: "totalProducts",
        },
    };

    // 3. use paginations
    const aggregate: Aggregate<ProductDocument[]> = Product.aggregate(pipeline);

    const allProducts: AggregatePaginateResult<ProductDocument> = await (
        aggregate as any
    ).aggregatePaginate(options);

    // 4. send response

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allProducts,
                "All Products information fetched successfully"
            )
        );
});

const getInfoOfProduct = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const zodResult = searchProductByIdZodSchema.safeParse(productId);

    if (!zodResult.success) {
        const error = zodResult.error.errors.map((e) => e.message).join(", ");
        throw new ApiError(400, error);
    }
    const { id } = zodResult.data;

    // we have to also get sellor informations

    const product = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
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
                            role: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$sellerInfo",
        },
    ]);

    // ONLY for merchant ---------
    /**
     * @todo Complete this
     */
    if (req.user?.role === "MERCHANT" && req.baseUrl.includes("/merchant")) {
    }

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                product,
                "Product Data fetched data successfully"
            )
        );
});

export { getAllProducts, getInfoOfProduct };
