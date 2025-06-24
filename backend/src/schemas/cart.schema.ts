import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const cartItemZod = z
    .object({
        productId: z.string({
            required_error: "Product Id is required",
            invalid_type_error: "Product Id must be string",
        }),
        quantity: z.coerce
            .number({
                required_error: "Quantity is required",
                invalid_type_error: "Quantity must be number",
            })
            .int({ message: "Quantity must be intergere" })
            .min(1, { message: "Quantity must be at least 1" }),
    })
    .refine(
        (data) => {
            if (!isValidObjectId(data.productId)) return false;
            return true;
        },
        {
            message: "Invalid product id",
            path: ["productId"],
        }
    );

export const cartZodSchema = z.object({
    _id: z.string({
        required_error: "Cart Id is required",
        invalid_type_error: "Cart Id must be string",
    }),
    userId: z.string({
        required_error: "User Id is required",
        invalid_type_error: "User Id must be string",
    }),
    amount: z
        .number({
            required_error: "Amount is required",
            invalid_type_error: "Amount must be number",
        })
        .min(0, { message: "Amount cannot be negative" }),
    products: z.array(cartItemZod).default([]),
    createdAt: z.date({
        required_error: "Creation date is required",
        invalid_type_error: "Creation date must be a Date object",
    }),
    updatedAt: z.date({
        required_error: "Update date is required",
        invalid_type_error: "Update date must be a Date object",
    }),
});

export const addItemInToCartZodSchema = z
    .object({
        productId: z.string({
            required_error: "Product Id is required",
            invalid_type_error: "Product Id must be string",
        }),
        quantity: z.coerce
            .number({
                required_error: "Quantity is required",
                invalid_type_error: "Quantity must be number",
            })
            .int({ message: "Quantity must be intergere" })
            .min(1, { message: "Quantity must be at least 1" }),
    })
    .refine(
        (data) => {
            if (!isValidObjectId(data.productId)) return false;
            return true;
        },
        {
            message: "Invalid product id",
            path: ["productId"],
        }
    );

export type cartType = z.infer<typeof cartZodSchema>;
export type cartItem = z.infer<typeof cartItemZod>;
export type addItemInCart = z.infer<typeof addItemInToCartZodSchema>;
