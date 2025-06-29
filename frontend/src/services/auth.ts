import { env } from "../config/env";
import type { OrderHistory } from "../types/order.types";
import type {
    BackendResponse,
    GeneralUserResponse,
    LoginUserData,
    LoginUserResponseData,
    SignUpData,
    SignUpDataResponse,
} from "../types/user.types";
import { authFetch } from "../utils/authFetch";

class AuthService {
    BASE_URL: string;
    constructor() {
        const isDev = env.isDev;
        this.BASE_URL = isDev ? "/api" : env.BASE_URL;
    }

    // /api -> http://localhost:3000/api/v1

    // test while developing frontend
    async signup(data: SignUpData) {
        try {
            const res = await fetch(`${this.BASE_URL}/auth/register`, {
                method: "POST",
                // credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const resData: BackendResponse<SignUpDataResponse> =
                await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during signup.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: signup :: ${error}`);
            throw error;
        }
    }

    async login(data: LoginUserData) {
        try {
            const res = await fetch(`${this.BASE_URL}/auth/login`, {
                method: "POST",
                // credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData: BackendResponse<LoginUserResponseData> =
                await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during login.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: login :: ${error}`);
            throw error;
        }
    }

    async logout() {
        try {
            const res = await authFetch(`${this.BASE_URL}/auth/logout`, true, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData: BackendResponse<{}> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during logout.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: logout :: ${error}`);
            throw error;
        }
    }

    async refreshToken() {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/auth/refreshToken`,
                true,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const resData = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during refreshToken.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: refreshToken :: ${error}`);
            throw error;
        }
    }
    /**
     *
     * update the user address or user avatar both are optional
     * @param data
     * @returns
     */
    // image !!!!!
    async updateDetails(data: { address: string }) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/auth/updateDeatils`,
                true,
                {
                    method: "PATCH",
                    credentials: "include",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const resData: BackendResponse<GeneralUserResponse> =
                await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during login.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: login :: ${error}`);
            throw error;
        }
    }

    async changePassword(data: { oldPassword: string; newPassword: string }) {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/auth/changePassword`,
                true,
                {
                    method: "PATCH",
                    credentials: "include",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const resData: BackendResponse<{}> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during changePassword.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: changePassword :: ${error}`);
            throw error;
        }
    }

    async getUserInfo() {
        try {
            const res = await authFetch(`${this.BASE_URL}/auth/me`, true, {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const resData: BackendResponse<GeneralUserResponse> =
                await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during getUserInfo.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: getUserInfo :: ${error}`);
            throw error;
        }
    }

    async getOrderHistory() {
        try {
            const res = await authFetch(
                `${this.BASE_URL}/auth/orderHistory`,
                true,
                {
                    credentials: "include",
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const resData: BackendResponse<OrderHistory> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message ||
                        "An unknown error occurred during getOrderHistory.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: getOrderHistory :: ${error}`);
            throw error;
        }
    }
}

const authservice = new AuthService();

export default authservice;

export { AuthService };
