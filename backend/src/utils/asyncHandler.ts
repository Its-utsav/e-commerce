import { NextFunction, Request, RequestHandler, Response } from "express";

const asyncHandler = (requestFunction: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await Promise.resolve(requestFunction(req, res, next));
        } catch (error: unknown) {
            next(error);
        }
    };
};

export default asyncHandler;
