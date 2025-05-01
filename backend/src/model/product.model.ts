import { Document, Model, model, Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ProductMethods {}

interface ProductData {
    name: string;
    imageUrl?: string;
    description: string;
    price: number;
    stock: number;
    discount: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ProductDocument
    extends ProductData,
        Document<Types.ObjectId>,
        ProductMethods {}

const productSchema = new Schema<
    ProductDocument,
    Model<ProductDocument>,
    ProductMethods
>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        imageUrl: { type: String },
        description: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 2000,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 99,
        },
    },
    { timestamps: true }
);

productSchema.plugin(mongooseAggregatePaginate);
const Product = model<ProductDocument>("Product", productSchema);

export default Product;
