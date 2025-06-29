import authservice from "../services/auth";
import type { BackendResponse, GeneralUserResponse } from "../types/user.types";

export async function authFetch(
    url: string,
    retry: boolean,
    options: RequestInit,
) {
    const res = await fetch(url, { ...options, credentials: "include" });
    const resBody: BackendResponse<{}> = await res.clone().json();
    if (
        (res.status === 401 && retry) ||
        resBody.message === "Invalaid Access token"
    ) {
        const isTokenRefreshed = await refreshAccessToken();
        if (isTokenRefreshed) {
            return authFetch(url, false, options);
        }
    }
    return res;
}

export async function refreshAccessToken() {
    try {
        const res = await fetch(`${authservice.BASE_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return false;
        const data: BackendResponse<GeneralUserResponse> = await res.json();
        if (data.success && data.data) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}
