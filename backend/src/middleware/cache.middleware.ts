import { NextFunction, Request, Response } from "express";

function caches(timeInSecond: number) {
    return (req: Request, res: Response, next: NextFunction) => {
        res.setHeader("Cache-Control", `public, max-age=${timeInSecond}`);
        next();
    };
}
export { caches };
