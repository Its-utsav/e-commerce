export interface BackendResponse<T> {
    data: T | null;
    statusCode: number;
    message: string;
    success: boolean;
}

enum USER_ROLE_TYPES {
    ADMIN,
    USER,
    MERCHANT,
}

export interface SignUpData {
    username: string;
    email: string;
    password: string;
    address?: string;
    role?: USER_ROLE_TYPES;
}

export interface SignUpDataResponse {
    _id: string;
    username: string;
    email: string;
    address?: string;
    role?: USER_ROLE_TYPES;
}

export interface LoginUserData {
    email: string;
    password: string;
}

export interface LoginUserResponseData {
    _id: string;
    username: string;
    avatarUrl: string;
    email: string;
    role: string;
}

export interface GeneralUserResponse {
    _id: string;
    username: string;
    avatarUrl?: string;
    email: string;
    role: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}
