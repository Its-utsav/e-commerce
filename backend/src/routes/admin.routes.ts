import { Router } from "express";
import {
    deleteOrderByAdmin,
    deleteUser,
    getAllUsers,
    getUserDeatils,
    updateUserRole,
    getAllOrdersDetails,
} from "../controllers/admin.controller";
import {
    deleteProduct,
    updateProductDetails,
} from "../controllers/merchant.controller";
import { getOrderDetails } from "../controllers/order.controller";
import {
    getAllProducts,
    getInfoOfProduct,
} from "../controllers/product.controller";
import adminOnly from "../middleware/admin.middleware";
import { verifyUser } from "../middleware/auth.middleware";
import { adminLimiter } from "../utils/rateLimiter";

const router = Router();

router.use(adminLimiter, verifyUser, adminOnly);
router.route("/users").get(getAllUsers);
router.route("/users/:userId").get(getUserDeatils).delete(deleteUser);
router.route("/user/role/:userId").patch(updateUserRole);

router.route("/merchant").get(getAllUsers);
router.route("/merchant/:merchant").get(getUserDeatils).delete(deleteUser);

router.route("/products").get(getAllProducts);
router
    .route("/products/:productId")
    .get(getInfoOfProduct)
    .patch(updateProductDetails)
    .delete(deleteProduct);

router.route("/orders").get(getAllOrdersDetails);
router
    .route("/orders/:ordersId")
    .get(getOrderDetails)
    .delete(deleteOrderByAdmin);

export default router;
