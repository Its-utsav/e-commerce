import mongoose, {
    AggregatePaginateModel,
    Document,
    model,
    Model,
    Schema,
    Types,
} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import Product, { ProductDocument } from "./product.model";

interface ICartMethods {
    calculateTotalAndUpdateQuantity(): Promise<void>;
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

interface ICartDocument
    extends ICartData,
        ICartMethods,
        Document<Types.ObjectId> {}

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
                _id: false,
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

cartSchema.methods.calculateTotalAndUpdateQuantity =
    async function (): Promise<void> {
        const product = this.products;
        // empty cart
        if (!product || product.length == 0) {
            this.amount = 0;
            this.totalItems = 0;
        }
        // fetch data for all products
        // 1. store the all product ids
        //  we use $in operator
        const productIds = product.map((item) => item.productId);

        const products: ProductDocument[] = await Product.find({
            _id: { $in: productIds },
        })
            .select("finalPrice")
            .lean()
            .exec();

        // console.table([this.totalItems, this.amount]);
        // console.table([productIds, products]);

        // store the price and their ids(along)
        const productPrice: { [id: string]: number } = {};

        products.forEach((product) => {
            if (product._id && typeof product.finalPrice === "number") {
                productPrice[product._id.toString()] = product.finalPrice;
            }
        });
        let totalQty = 0; // count the total quantity
        // iteraing on product  and we will get final price by multiply by quantity
        const total = product.reduce((sum, item) => {
            // get price by product id from productPrice object
            const price = productPrice[item.productId.toString()] || 0; // play safe
            const qty = item.quantity || 0;
            totalQty += qty;
            return sum + price * qty;
        }, 0);
        this.amount = total;
        this.totalItems = totalQty;
    };

cartSchema.pre("save", async function (next) {
    console.log("Pre hook run", this);
    await this.calculateTotalAndUpdateQuantity();
    next();
});

export interface CartModel
    extends Model<ICartDocument>,
        AggregatePaginateModel<ICartDocument> {}

const Cart = model<ICartDocument, CartModel>("Cart", cartSchema);
export default Cart;
