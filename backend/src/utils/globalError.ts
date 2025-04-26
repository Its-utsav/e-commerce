import { NextFunction, Request, Response } from "express";
import ApiError from "./ApiError";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message =
        err instanceof ApiError ? err.message : "Internal Server error";
    return res.status(statusCode).json({
        success: false,
        message,
    });
}


export default globalErrorHandler