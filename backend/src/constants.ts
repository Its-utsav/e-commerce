import { CookieOptions } from "express";

export const PREFIX_URL = "/api/v1";
export const options: CookieOptions = {
    httpOnly: true,
    secure: true,
};
