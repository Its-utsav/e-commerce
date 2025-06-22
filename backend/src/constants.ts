import { CookieOptions } from "express";

export const PREFIX_URL = "/api/v1";
const isDevEnv = process.env.NODE_ENV === "DEV";
export const options: CookieOptions = {
    httpOnly: true,
    secure: !isDevEnv,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
