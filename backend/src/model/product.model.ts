import { Document, model, ObjectId, Schema } from "mongoose";
import { productType } from "../schemas/product.schema";

interface IUser extends Document, productType {
    _id: ObjectId;
}

interface ProductDocument extends IUser {}

const productSchema = new Schema<ProductDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        imageUrl: { type: String },
        description: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 2000,
        },
        price: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Product = model("Product", productSchema);

export default Product;
