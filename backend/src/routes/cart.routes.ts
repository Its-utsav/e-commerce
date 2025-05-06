import { Router } from "express";
import { verifyUser } from "../middleware/auth.middleware";
import {
    addProductToTheCart,
    deleteCart,
    deleteProductFromCart,
    getCartDetails,
    updateProductQuanity,
} from "../controllers/cart.controller";

const router = Router();

router.use(verifyUser);
router.route("/me").get(getCartDetails);
router.route("/me/items").post(addProductToTheCart);
router
    .route("/me/items")
    .patch(updateProductQuanity)
    .delete(deleteProductFromCart);
router.route("/me/clear").delete(deleteCart);

export default router;
