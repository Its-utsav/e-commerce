import type { CartDeatils } from "../../types/cart.types";
import type { BackendResponse } from "../../types/user.types";

class CartService {
    BASE_URL: string;
    constructor() {
        const isDev = import.meta.env.DEV;
        this.BASE_URL = isDev ? "/api" : import.meta.env.BACKEND_URL;
    }

    async getCartDeatils() {
        try {
            const res = await fetch(`${this.BASE_URL}/cart/me`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const responseBody: BackendResponse<CartDeatils> = await res.json();
            if (!res.ok || !responseBody.success) {
                throw new Error(responseBody.message || "An unknown error occurred during getCartDeatils.")
            }
            return responseBody.data;
        } catch (error) {
            console.error(`error :: getCartDeatils :: ${error}`);
            throw error;
        }
    }

    // TODO - complete when require ha ha
};

const cartService = new CartService();


export default cartService;
export {
    CartService
}