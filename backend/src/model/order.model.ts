import {
    AggregatePaginateModel,
    Document,
    Model,
    model,
    Schema,
    Types,
} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
interface OrderMethods {}

interface IProductItems {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrderData {
    userId: Types.ObjectId;
    products: IProductItems[];
    amount: number;
    paymentMethod: "UPI" | "COD" | "STRIPE" | "RAZORPAY";
    status: "PENDING" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "COMPLETED";
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderDocument
    extends IOrderData,
        Document<Types.ObjectId>,
        OrderMethods {}

const orderSchema = new Schema<
    OrderDocument,
    Model<OrderDocument>,
    OrderMethods
>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "COD", "STRIPE", "RAZORPAY"],
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "DELIVERED", "CANCELLED"],
            default: "PENDING",
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED"],
            default: "PENDING",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
orderSchema.plugin(mongooseAggregatePaginate);
interface orderModel
    extends Model<OrderDocument>,
        AggregatePaginateModel<OrderDocument> {}
const Order = model<OrderDocument, orderModel>("Order", orderSchema);
export default Order;
