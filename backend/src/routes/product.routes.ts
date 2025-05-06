import { Router } from "express";
import {
    getAllProducts,
    getInfoOfProduct,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getAllProducts);
router.get("/:productId", getInfoOfProduct);

export default router;
