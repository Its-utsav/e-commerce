import mongoose, { AggregatePaginateModel, Document, Model, model, Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ProductMethods {
    isStockAvailable(): boolean;
}

export interface ProductData {
    name: string;
    sellerId: Types.ObjectId;
    imageUrls?: string[];
    description: string;
    originalPrice: number;
    finalPrice: number; // i will calculate price based on discount in percentage
    stock: number;
    discountInPercentage: number;
    discountInPrice: number; // i will calculate based on discount in percentage
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductDocument
    extends ProductData,
    Document<Types.ObjectId>,
    ProductMethods { }


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
        imageUrls: [{ type: String }],
        description: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 2000,
        },
        originalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        finalPrice: {
            type: Number,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        discountInPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 99,
        },
        discountInPrice: {
            type: Number,
            min: 0,
        },
    },
    { timestamps: true }
);

productSchema.plugin(mongooseAggregatePaginate);

productSchema.pre("save", function (next) {
    if (
        this.discountInPercentage === 0 ||
        !this.isModified("discountInPercentage")
    ) {
        this.finalPrice = this.originalPrice;
        next();
    }
    this.discountInPrice =
        (Number(this.originalPrice) * Number(this.discountInPercentage)) / 100;
    this.finalPrice = this.originalPrice - this.discountInPrice;

    next();
});

productSchema.methods.isStockAvailable = function () {
    return this.stock > 0;
};

export interface ProductModel
    extends Model<ProductDocument>, AggregatePaginateModel<ProductDocument> { }


const Product = model<ProductDocument, ProductModel>("Product", productSchema);

export type ProductFilter = mongoose.FilterQuery<ProductData>;

export default Product;
