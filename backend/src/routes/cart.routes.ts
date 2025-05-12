import { Router } from "express";
import {
    addProductToTheCart,
    deleteCart,
    deleteProductFromCart,
    getCartDetails,
    updateProductQuanity,
} from "../controllers/cart.controller";
import { verifyUser } from "../middleware/auth.middleware";
import { formData } from "../middleware/multer.middleware";
import { cartLimiter, userLimiter } from "../utils/rateLimiter";

const router = Router();

router.use(verifyUser, formData);
router.route("/me").get(userLimiter, getCartDetails);
router.route("/me/items").post(addProductToTheCart);

router.use(cartLimiter);
router
    .route("/me/items/:productId")
    .patch(updateProductQuanity)
    .delete(deleteProductFromCart);
router.route("/me/clear").delete(deleteCart);

export default router;
