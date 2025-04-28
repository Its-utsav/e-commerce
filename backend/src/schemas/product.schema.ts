import { z } from "zod";

export const productZodSchema = z.object({
    _id: z.string({
        required_error: "Product Id is required",
        invalid_type_error: "Product Id must be string",
    }),
    name: z.string({
        message: "Product name is required",
    }),
    imageUrl: z.string().optional(),
    description: z
        .string()
        .min(5, "Product description must have minimum 5 characters")
        .max(2000, "Product description can have maximum 2000 characters"),
    price: z
        .number({
            required_error: "Product price is required",
            invalid_type_error: "Product price must be a number",
        })
        .min(0, { message: "Product price can not be less than zero (0)." }),
    stock: z
        .number({
            required_error: "Product stock is required",
            invalid_type_error: "Product stock must be a number",
        })
        .int({ message: "Product stock must be an integer" })
        .min(0, { message: "Product stock can not be less than zero (0)." }),
    discount: z
        .number({
            invalid_type_error: "Product discound must be a number",
        })
        .min(0, { message: "Product discound can not be negative" })
        .optional()
        .default(0),
    createdAt: z.date({
        required_error: "Creation date is required",
        invalid_type_error: "Creation date must be a Date object",
    }),
    updatedAt: z.date({
        required_error: "Update date is required",
        invalid_type_error: "Update date must be a Date object",
    }),
});

export type productType = z.infer<typeof productZodSchema>;
