import type { AllProducts, ProdcutDetails } from "../../types/product.types";
import type { BackendResponse } from "../../types/user.types";

class ProductService {
    BASE_URL: string;
    constructor() {
        const isDev = import.meta.env.DEV;
        this.BASE_URL = isDev ? "/api" : import.meta.env.BACKEND_URL;
    }

    async getProductsDetails(query: string = "") {
        try {
            const res = await fetch(`${this.BASE_URL}/products?${query}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const resData: BackendResponse<AllProducts> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during getProductsDetails.",
                );
            }
            return resData.data;
        } catch (error) {
            console.error(`error :: getProductsDetails :: ${error}`);
            throw error;
        }
    }
    async getProductDetails(productId: string) {
        try {
            const res = await fetch(`${this.BASE_URL}/products/${productId}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const resData: BackendResponse<ProdcutDetails> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during getProductDetails.",
                );
            }
            return resData.data;
        } catch (error) {
            console.error(`error :: getProductDetails :: ${error}`);
            throw error;
        }
    }
}

const productService = new ProductService();
export default productService;
export {
    ProductService
}