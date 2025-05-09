import { Router } from "express";
import {
    addProductToTheCart,
    deleteCart,
    deleteProductFromCart,
    getCartDetails,
    updateProductQuanity,
} from "../controllers/cart.controller";
import { verifyUser } from "../middleware/auth.middleware";

const router = Router();

router.use(verifyUser);
router.route("/me").get(getCartDetails);
router.route("/me/items").post(addProductToTheCart);
router
    .route("/me/items/:productId")
    .patch(updateProductQuanity)
    .delete(deleteProductFromCart);
router.route("/me/clear").delete(deleteCart);

export default router;
