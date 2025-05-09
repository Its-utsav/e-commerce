import mongoose, { model, Schema, Document, Model, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import Product, { ProductDocument } from "./product.model";

interface totalAndQty {
    total: number;
    qty: number;
}
interface ICartMethods {
    calculateTotal(): Promise<totalAndQty>;
}

interface ICartProductItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}

interface ICartData {
    // _id: ObjectId;
    amount: number;
    userId: mongoose.Types.ObjectId;
    products: ICartProductItem[];
    totalItems: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ICartDocument extends ICartData, Document<Types.ObjectId> {}

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
            min: 0,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
            unique: true,
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
        totalItems: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);
cartSchema.plugin(mongooseAggregatePaginate);

cartSchema.methods.calculateTotal = async function (): Promise<totalAndQty> {
    const product = this.products;
    // empty cart
    if (!product || product.length == 0) {
        return {
            total: 0,
            qty: 0,
        };
    }
    // fetch data fro all products
    // 1. store the all product ids
    //  we use $in operator
    const productIds = product.map((item) => item.productId);
    const products: ProductDocument[] = await Product.find({
        _id: { $in: productIds },
    })
        .select("finalPrice")
        .lean()
        .exec();

    // store the price and their ids(along)
    const productPrice: { [id: string]: number } = {};

    products.forEach((product) => {
        if (product._id && typeof product.finalPrice === "number") {
            productPrice[product._id.toString()] = product.finalPrice;
        }
    });
    let totalQty = 0; // count the total quantity
    // iteraing on product  and we will get final price by multiply by quantity
    let total = product.reduce((sum, item) => {
        // get price by product id from productPrice object
        const price = productPrice[item.productId.toString()] || 0; // play safe
        const qty = item.quantity || 0;
        totalQty += qty;
        return sum + price * qty;
    }, 0);

    return {
        total: total,
        qty: totalQty,
    };
};

cartSchema.pre("save", async function (next) {
    const { qty, total } = await this.calculateTotal();
    if (
        this.isModified("totalItems") ||
        this.amount !== total ||
        this.totalItems !== qty ||
        this.isModified("products")
    ) {
        this.amount = total;
        this.totalItems = qty;
        await this.save();
        next();
    }
    next();
});

const Cart = model("Cart", cartSchema);
export default Cart;
