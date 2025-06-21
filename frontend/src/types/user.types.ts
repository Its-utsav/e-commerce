export interface BackendResponse<T> {
    data: T | null;
    statusCode: number;
    message: string;
    success: boolean;
}

enum USER_ROLE_TYPES {
    ADMIN,
    USER,
    MERCHANT
}

export interface SignUpData {
    username: string;
    email: string;
    password: string;
    address?: string;
    role?: USER_ROLE_TYPES
}

export interface SignUpDataResponse {
    username: string;
    email: string;
    address?: string;
    role?: USER_ROLE_TYPES
}


export interface LoginUserData {
    email: string;
    password: string;
}

export interface LoginUserResponseData {
    username: string,
    avatarUrl: string,
    email: string,
    role: string,
}

export interface GeneralUserResponse {
    username: string,
    avatarUrl?: string,
    email: string,
    role: string,
    address?: string,
}