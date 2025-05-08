import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";

const placeNewOrder = asyncHandler(async (req: Request, res: Response) => {});
const getOrderHistoryDetails = asyncHandler(
    async (req: Request, res: Response) => {}
);
const getOrderDetails = asyncHandler(async (req: Request, res: Response) => {});
const cancelOrder = asyncHandler(async (req: Request, res: Response) => {});
const makeAPayment = asyncHandler(async (req: Request, res: Response) => {});

export {
    placeNewOrder,
    getOrderDetails,
    cancelOrder,
    makeAPayment,
    getOrderHistoryDetails,
};
