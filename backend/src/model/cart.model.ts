import { model, ObjectId, Schema, Document, Model, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
interface ICartMethods {
    calculateTotal(): Promise<number>
}

interface ICartProductItem {
    productId: ObjectId;
    quantity: number;
}

interface ICartData {
    // _id: ObjectId;
    amount: number;
    userId: ObjectId;
    products: ICartProductItem[];
    createdAt: Date;
    updatedAt: Date;
}

interface ICartDocument extends ICartData, Document<Types.ObjectId> { }

const cartSchema = new Schema<
    ICartDocument,
    Model<ICartDocument>,
    ICartMethods
>(
    {
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);
cartSchema.plugin(mongooseAggregatePaginate);
cartSchema.methods.calculateTotal = async function () {
    const product = this.products;

    return 0;
}
const Cart = model("Cart", cartSchema);
export default Cart;
