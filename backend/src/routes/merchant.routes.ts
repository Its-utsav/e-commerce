import { Router } from "express";
import {
    createNewProduct,
    deleteProduct,
    getMerchantAllOrdersDetails,
    getMerchantOrdersDetails,
    updateOrderStatus,
    updateProductDetails,
} from "../controllers/merchant.controller";
import {
    getAllProducts,
    getInfoOfProduct,
} from "../controllers/product.controller";
import { getUserInfo, updateUser } from "../controllers/user.controller";
import { verifyUser } from "../middleware/auth.middleware";
import merchantOnly from "../middleware/merchant.middleware";
import { upload } from "../middleware/multer.middleware";

const router = Router();

router.use(verifyUser, merchantOnly);
router.route("/me").get(getUserInfo).post(upload.single("avatar"), updateUser);

router
    .route("/products")
    .post(upload.array("productImg", 5), createNewProduct)
    .get(getAllProducts);
router
    .route("/products/:productId")
    .get(getInfoOfProduct)
    .patch(updateProductDetails)
    .delete(deleteProduct);

router.route("/orders").get(getMerchantAllOrdersDetails);
router.route("/orders/:orderId").get(getMerchantOrdersDetails);
router.route("/orders/status/:orderId").get(updateOrderStatus);

export default router;
