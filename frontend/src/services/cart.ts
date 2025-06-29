import { env } from "../config/env";
import type {
    CartDeatils,
    CartProduct,
    NewProductInCart,
    ProductsIdAndQty,
    removeProductFromCart,
} from "../types/cart.types";
import type { BackendResponse } from "../types/user.types";
import { authFetch } from "../utils/authFetch";

class CartService {
    BASE_URL: string;
    constructor() {
        const isDev = env.isDev;
        this.BASE_URL = isDev ? "/api" : env.BASE_URL;
    }

    // /api -> http://localhost:3000/api/v1

    async getCartDeatils() {
        try {
            const res = await authFetch(`${this.BASE_URL}/carts/me`, true, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const responseBody: BackendResponse<CartDeatils> = await res.json();
            if (!res.ok || !responseBody.success) {
                throw new Error(
                    responseBody.message ||
                        "An unknown error occurred during getCartDeatils.",
                );
            }
            return responseBody.data;
        } catch (error) {
            console.error(`error :: getCartDeatils :: ${error}`);
            throw error;
        }
    }

    async addProductToTheCart(data: CartProduct) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/carts/me/items`,
                true,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );
            const responseBody: BackendResponse<NewProductInCart> =
                await res.json();
            if (!res.ok || !responseBody.success) {
                throw new Error(
                    responseBody.message ||
                        "An unknown error occurred during addProductToTheCart.",
                );
            }
            return responseBody.data;
        } catch (error) {
            console.error(`error :: addProductToTheCart :: ${error}`);
            throw error;
        }
    }

    async updateProductQuantity(productId: string, data: ProductsIdAndQty) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/carts/me/items/${productId}`,
                true,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );
            const responseBody: BackendResponse<CartDeatils> = await res.json();
            if (!res.ok || !responseBody.success) {
                throw new Error(
                    responseBody.message ||
                        "An unknown error occurred during updateProductQuantity.",
                );
            }
            return responseBody.data;
        } catch (error) {
            console.error(`error :: updateProductQuantity :: ${error}`);
            throw error;
        }
    }

    async deleteProductFromCart(productId: string) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/carts/me/items/${productId}`,
                true,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const responseBody: BackendResponse<removeProductFromCart> =
                await res.json();
            if (!res.ok || !responseBody.success) {
                throw new Error(
                    responseBody.message ||
                        "An unknown error occurred during deleteProductFromCart.",
                );
            }
            return responseBody.data;
        } catch (error) {
            console.error(`error :: deleteProductFromCart :: ${error}`);
            throw error;
        }
    }

    async emptyCart() {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/carts/me/clear`,
                true,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const responseBody: BackendResponse<removeProductFromCart> =
                await res.json();
            if (!res.ok || !responseBody.success) {
                throw new Error(
                    responseBody.message ||
                        "An unknown error occurred during deleteProductFromCart.",
                );
            }
            return responseBody.data;
        } catch (error) {
            console.error(`error :: deleteProductFromCart :: ${error}`);
            throw error;
        }
    }
}

const cartService = new CartService();

export default cartService;
export { CartService };
