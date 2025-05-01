import { Request, Response } from "express";
import Product, { ProductDocument } from "../model/product.model";
import {
    productFindQueryZodSchema,
    productFindQuery,
} from "../schemas/product.schema";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { Aggregate, AggregatePaginateResult, PaginateOptions, PipelineStage } from "mongoose";




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

    // F1 ---- Based on search query ----
    if (search) {
        match.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    // F2 ------- Based on price -------

    // min or max price required
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

    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    // ----- SORTING -----
    const sort: { [key: string]: 1 | -1 } = {};
    const [sortField, sortOrder] = sortBy.split(":");
    pipeline.push({ $sort: sort });

    const allowedSortFields = ['createdAt', 'price', 'name', 'stock']; // Add fields you allow sorting by
    if (allowedSortFields.includes(sortField)) {
        sort[sortField] = sortOrder === 'asc' ? 1 : -1; // 1 for ascending, -1 for descending
    } else {
        // Fallback to default sort if field is invalid
        sort.createdAt = -1;
    }
    const options: PaginateOptions = {
        page: page,
        limit: limit,
        customLabels: {
            docs: "products",
            totalDocs: "totalProducts"
        }
    }
    // 3. use paginations
    const aggregate: Aggregate<ProductDocument[]> = Product.aggregate(pipeline);

    const allProducts: AggregatePaginateResult<ProductDocument> = await (aggregate as any).aggregatePaginate(options)

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

const getInfoOfProduct = asyncHandler(
    async (req: Request, res: Response) => { }
);

export { getAllProducts, getInfoOfProduct };
