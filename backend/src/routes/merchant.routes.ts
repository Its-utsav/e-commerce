import { Router } from "express";
import {
    createNewProduct,
    deleteProduct,
    getMerchantAllOrdersDetails,
    getMerchantOrdersDetails,
    updateOrderStatus,
    updateProductDetails,
    getMerchantProduct,
} from "../controllers/merchant.controller";
import { getAllProducts } from "../controllers/product.controller";
import { getUserInfo, updateUser } from "../controllers/user.controller";
import { verifyUser } from "../middleware/auth.middleware";
import merchantOnly from "../middleware/merchant.middleware";
import { formData, upload } from "../middleware/multer.middleware";
import { merchantLimiter, userLimiter } from "../utils/rateLimiter";

const router = Router();

router.use(verifyUser, merchantOnly);
router
    .route("/me")
    .get(getUserInfo)
    .patch(userLimiter, upload.single("avatar"), updateUser);
router.use(merchantLimiter);
router
    .route("/products")
    .post(upload.array("productImg", 5), createNewProduct)
    .get(getAllProducts);
router
    .route("/products/:productId")
    .get(getMerchantProduct)
    .patch(upload.array("productImg", 5), updateProductDetails)
    .delete(deleteProduct);

router.route("/orders").get(getMerchantAllOrdersDetails);
router.route("/orders/:orderId").get(getMerchantOrdersDetails);
router.route("/orders/status/:orderId").patch(formData, updateOrderStatus);

export default router;
