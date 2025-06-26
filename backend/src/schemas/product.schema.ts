import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const createProductZodSchema = z.object({
    name: z.string({
        message: "Product name is required",
        required_error: "Product name is required",
    }),
    imageUrls: z
        .array(z.string().optional())
        .max(5, {
            message: "You can't upload more than 5 photos",
        })
        .optional(),

    description: z
        .string()
        .min(5, "Product description must have minimum 5 characters")
        .max(2000, "Product description can have maximum 2000 characters"),
    price: z.coerce
        .number({
            required_error: "Product price is required",
            invalid_type_error: "Product price must be a number",
        })
        .min(0, { message: "Product price can not be less than zero (0)." }),
    stock: z.coerce
        .number({
            required_error: "Product stock is required",
            invalid_type_error: "Product stock must be a number",
        })
        .int({ message: "Product stock must be an integer" })
        .min(0, { message: "Product stock can not be less than zero (0)." }),
    discount: z.coerce
        .number({
            invalid_type_error: "Product discound must be a number",
        })
        .min(0, { message: "Product discound can not be negative" })
        .max(100, { message: "Product discound can not be more than 100" })
        .optional()
        .default(0),
});

export type createProductType = z.infer<typeof createProductZodSchema>;

export const productFindQueryZodSchema = z
    .object({
        search: z.string().optional(),
        minPrice: z.preprocess(
            (val) =>
                val === null || val === undefined || val === ""
                    ? undefined
                    : Number(val),

            z
                .number()
                .min(0, {
                    message: "Minimum price can not be negiatve number. ",
                })
                .optional()
        ),
        maxPrice: z.preprocess(
            (val) =>
                val === null || val === undefined || val === ""
                    ? undefined
                    : Number(val),
            z
                .number()
                .min(0, {
                    message: "Maximum price can not be negiatve number. ",
                })
                .optional()
        ),
        page: z.preprocess(
            (val) =>
                val === null || val === undefined || val === ""
                    ? 1
                    : Number(val),
            z
                .number()
                .int("Page must be an integer")
                .min(1, "Page must be at least 1")
                .default(1)
        ),
        limit: z.preprocess(
            (val) =>
                val === null || val === undefined || val === ""
                    ? 10
                    : Number(val),
            z
                .number()
                .int("Limit must be an integer")
                .min(1, "Limit must be at least 1")
                .max(100, "Limit cannot exceed 100")
                .default(10)
        ),
        sortBy: z.string().optional().default("createdAt:desc"),
    })
    .refine(
        (data) => {
            // max price should be greater
            if (
                data.maxPrice !== undefined &&
                data.minPrice !== undefined &&
                data.maxPrice < data.minPrice
            ) {
                return false;
            }

            return true;
        },
        {
            message: "Maximum price cannot be less than minimum price",
            path: ["maxPrice"],
        }
    );
export type productFindQuery = z.infer<typeof productFindQueryZodSchema>;

export const searchProductByIdZodSchema = z
    .object({
        id: z.string({
            required_error: "Product id is required",
        }),
    })
    .refine(
        (data) => {
            if (!isValidObjectId(data.id)) {
                return false;
            }
            return true;
        },
        {
            message: "Invalid Product Id",
            path: ["id"],
        }
    );

export type searchProductById = z.infer<typeof searchProductByIdZodSchema>;

export const updateProductDetailsZodSchema = z.object({
    name: z
        .string({
            message: "Product name is required",
        })
        .optional(),
    description: z
        .string()
        .min(5, "Product description must have minimum 5 characters")
        .max(2000, "Product description can have maximum 2000 characters")
        .optional(),
    price: z.coerce
        .number({
            required_error: "Product price is required",
            invalid_type_error: "Product price must be a number",
        })
        .min(0, { message: "Product price can not be less than zero (0)." })
        .optional(),
    stock: z.coerce
        .number({
            required_error: "Product stock is required",
            invalid_type_error: "Product stock must be a number",
        })
        .int({ message: "Product stock must be an integer" })
        .min(0, { message: "Product stock can not be less than zero (0)." })
        .optional(),
    discount: z.coerce
        .number({
            invalid_type_error: "Product discount must be a number",
        })
        .min(0, { message: "Product discount can not be negative" })
        .max(100, { message: "Product discount can not be more than 100" })
        .default(0)
        .optional(),
});
export type updateProductDetails = z.infer<
    typeof updateProductDetailsZodSchema
>;
