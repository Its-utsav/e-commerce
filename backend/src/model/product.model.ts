import mongoose, { Document, Model, model, Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ProductMethods { }

export interface ProductData {
    name: string;
    sellerId: Types.ObjectId;
    imageUrl?: string;
    description: string;
    price: number;
    stock: number;
    discount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductDocument
    extends ProductData,
    Document<Types.ObjectId>,
    ProductMethods { }

export interface ProductModel
    extends Model<ProductDocument, {}, ProductMethods> {
    aggregatePaginate: typeof mongooseAggregatePaginate;
}

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
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            index: true,
            required: true,
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
const Product = model<ProductDocument, ProductModel>("Product", productSchema);

export type ProductFilter = mongoose.FilterQuery<ProductData>;

export default Product;
