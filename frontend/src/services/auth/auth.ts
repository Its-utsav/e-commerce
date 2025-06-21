import type {
    BackendResponse,
    GeneralUserResponse,
    LoginUserData,
    LoginUserResponseData,
    SignUpData,
    SignUpDataResponse,
} from "../../types/user.types";

class AuthService {
    BASE_URL: string;
    constructor() {
        const isDev = import.meta.env.DEV;
        this.BASE_URL = isDev ? "/api" : import.meta.env.BACKEND_URL;
    }
    // /api -> http://localhost:3000/api/v1
    async signup(data: SignUpData) {
        try {
            const res = await fetch(`${this.BASE_URL}/auth/register`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData: BackendResponse<SignUpDataResponse> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during signup.",
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
                credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData: BackendResponse<LoginUserResponseData> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during login.",
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
            const res = await fetch(`${this.BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during logout.",
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
            const res = await fetch(`${this.BASE_URL}/auth/refreshToken`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during refreshToken.",
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
    async updateDetails(data: { address: string }) {
        try {
            const res = await fetch(`${this.BASE_URL}/auth/updateDeatils`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const resData: BackendResponse<GeneralUserResponse> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during login.",
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
            const res = await fetch(`${this.BASE_URL}/auth/changePassword`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const resData: BackendResponse<GeneralUserResponse> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during changePassword.",
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
            const res = await fetch(`${this.BASE_URL}/auth/me`, {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const resData: BackendResponse<GeneralUserResponse> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during getUserInfo.",
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
            const res = await fetch(`${this.BASE_URL}/auth/orderHistory`, {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const resData: BackendResponse<GeneralUserResponse> = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(
                    resData.message || "An unknown error occurred during getUserInfo.",
                );
            }

            return resData.data;
        } catch (error) {
            console.error(`error :: getUserInfo :: ${error}`);
            throw error;
        }
    }

}

const authservice = new AuthService();

export default authservice;

export { AuthService };
