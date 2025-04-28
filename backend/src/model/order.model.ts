import { Document, model, ObjectId, Schema } from "mongoose";
import { orderType } from "../schemas/order.schema";

interface IOrder extends Document, orderType {
    _id: ObjectId;
    userId: ObjectId;
    products: ObjectId;
}
interface OrderDocument extends IOrder {}

const orderSchema = new Schema<OrderDocument>(
    {
        amount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "COD", "STRIPE", "RAZORPAY"],
        },
        status: {
            type: String,
            enum: ["PENDING", "DELIVERED", "CANCELLED"],
            default: "PENDING",
        },
    },
    {
        timestamps: true,
    }
);

const Order = model("Order", orderSchema);
export default Order;
