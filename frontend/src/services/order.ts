import { env } from "../config/env";
import type { NewOrder, OrderHistory } from "../types/order.types";
import type { BackendResponse } from "../types/user.types";
import { authFetch } from "../utils/authFetch";

class OrderService {
    BASE_URL: string;
    constructor() {
        const isDev = env.isDev;
        this.BASE_URL = isDev ? "/api" : env.BASE_URL;
    }
    // /api -> http://localhost:3000/api/v1
    async placeANewOrder(data: NewOrder) {
        try {
            const res = await authFetch(`${this.BASE_URL}/orders`, true, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const resBody: BackendResponse<OrderHistory> = await res.json();
            if (!res.ok || !resBody.success) {
                console.error(
                    resBody.message ||
                        "An unknown error occurred during placeANewOrder.",
                );
            }
            return resBody.data;
        } catch (error) {
            console.error(`error :: placeANewOrder :: ${error}`);
            throw error;
        }
    }

    async getOrderDetails(orderId: string) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/orders/${orderId}`,
                true,
                {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const resBody: BackendResponse<OrderHistory> = await res.json();
            if (!res.ok || !resBody.success) {
                console.error(
                    resBody.message ||
                        "An unknown error occurred during getOrderDetails.",
                );
            }
            return resBody.data;
        } catch (error) {
            console.error(`error :: getOrderDetails ${error}`);
            throw error;
        }
    }

    async makePayment(orderId: string) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/orders/${orderId}/pay`,
                true,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const resBody: BackendResponse<PaymentResponse> = await res.json();
            if (!res.ok || !resBody.success) {
                console.error(
                    resBody.message ||
                        "An unknown error occurred during makePayment.",
                );
            }
            return resBody.data;
        } catch (error) {
            console.error(`error :: makePayment ${error}`);
            throw error;
        }
    }

    async cancelOrder(orderId: string) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/orders/${orderId}/cancel`,
                true,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const resBody: BackendResponse<{}> = await res.json();
            if (!res.ok || !resBody.success) {
                console.error(
                    resBody.message ||
                        "An unknown error occurred during makePayment.",
                );
            }
            return resBody;
        } catch (error) {
            console.error(`error :: makePayment ${error}`);
            throw error;
        }
    }
}
const orderService = new OrderService();

export default orderService;
export { OrderService };
