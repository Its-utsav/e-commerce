import { Router } from "express";
import {
    getAllProducts,
    getInfoOfProduct,
} from "../controllers/product.controller";
import { generalLimiter } from "../utils/rateLimiter";

const router = Router();
router.use(generalLimiter);
router.get("/", getAllProducts);
router.get("/:productId", getInfoOfProduct);

export default router;
