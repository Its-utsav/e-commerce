import { TypeOf, z } from "zod";

// create prder
export const createOrderItemInputZodSchema = z.object({
    productId: z.string({
        required_error: "Product ID is required for each item",
        invalid_type_error: "Product ID must be a string",
    }),
    quantity: z
        .number({
            required_error: "Quantity is required for each item",
            invalid_type_error: "Quantity must be a number",
        })
        .int({ message: "Quantity must be an integer" })
        .min(1, { message: "Quantity must be at least 1" }),
});
// create a order
export const createOrderInputZodSchema = z.object({
    // Multiple orders
    items: z
        .array(createOrderItemInputZodSchema)
        .min(1, { message: "An Order have atleast one product" }).optional(),
    paymentMethod: z.enum(["UPI", "COD", "STRIPE", "RAZORPAY"], {
        required_error: "Payment method is required",
        invalid_type_error: "Invalid payment method",
    }),
});

export const orderItemOutputZodSchema = z.object({
    productId: z.string({
        required_error: "Product Id is required",
        invalid_type_error: "Product Id must be string",
    }),
    price: z
        .number({
            required_error: "Product price is required",
            invalid_type_error: "Product price must be number",
        })
        .min(0, { message: "Product price cannot be negative" }),

    quantity: z
        .number({
            required_error: "Quantity is required in order item data",
            invalid_type_error: "Quantity must be a number in order item data",
        })
        .int({ message: "Quantity must be an integer" })
        .min(1, { message: "Quantity must be at least 1" }),
});

export const orderOutputZodSchema = z.object({
    _id: z.string({
        // Order Id
        required_error: "Order Id is required",
        invalid_type_error: "Order Id must be string",
    }),
    userId: z.string({
        // User Id of this order
        required_error: "User Id is required",
        invalid_type_error: "User Id must be string",
    }),
    products: z.array(orderItemOutputZodSchema).default([]),
    amount: z
        .number({
            required_error: "Order amount is required",
            invalid_type_error: "Order amount must be number",
        })
        .min(0, { message: "Order amount cannot be negative" }),
    paymentMethod: z.enum(["UPI", "COD", "STRIPE", "RAZORPAY"], {
        required_error: "Payment Method must be seleted",
    }),
    status: z.enum(["PENDING", "DELIVERED", "CANCELLED"]).default("PENDING"),
    createdAt: z.date({
        required_error: "Creation date is required",
        invalid_type_error: "Creation date must be a Date object",
    }),
    updatedAt: z.date({
        required_error: "Update date is required",
        invalid_type_error: "Update date must be a Date object",
    }),
});

export const updateOrderStatusZodSchema = z.object({
    status: z.enum(["PENDING", "DELIVERED", "CANCELLED"], {
        required_error: "Order status is required",
    }),
});

export type orderType = z.infer<typeof orderOutputZodSchema>;
export type createOrder = z.infer<typeof createOrderInputZodSchema>;
export type updateOrderStatusType = z.infer<typeof updateOrderStatusZodSchema>;
