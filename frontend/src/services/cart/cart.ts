import type { CartDeatils, CartProduct } from "../../types/cart.types";
import type { BackendResponse } from "../../types/user.types";

class CartService {
    BASE_URL: string;
    constructor() {
        const isDev = import.meta.env.DEV;
        this.BASE_URL = isDev ? "/api" : import.meta.env.BACKEND_URL;
    }

    async getCartDeatils() {
        try {
            const res = await fetch(`${this.BASE_URL}/carts/me`, {
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
            const res = await fetch(`${this.BASE_URL}/carts/me`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
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
}

const cartService = new CartService();

export default cartService;
export { CartService };
