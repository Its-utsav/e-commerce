import { Router } from "express";
import {
    deleteOrder,
    deleteProduct,
    deleteUser,
    getAllUsers,
    getUserDeatils,
    updateProduct,
    updateUserRole,
} from "../controllers/admin.controller";
import {
    getAllProducts,
    getInfoOfProduct,
} from "../controllers/product.controller";
import adminOnly from "../middleware/admin.middleware";
import { verifyUser } from "../middleware/auth.middleware";

const router = Router();

router.use(verifyUser, adminOnly);
router.route("/users").get(getAllUsers);
router.route("/users/:userId").get(getUserDeatils).delete(deleteUser);
router.route("/user/role/:userId").patch(updateUserRole);

router.route("/merchant").get(getAllUsers);
router.route("/merchant/:merchant").get(getUserDeatils).delete(deleteUser);

router.route("/products").get(getAllProducts);
router
    .route("/products/:productId")
    .get(getInfoOfProduct)
    .patch(updateProduct)
    .delete(deleteProduct);

router.route("/orders").get(getAllProducts);
router.route("/orders/:ordersId").get(getInfoOfProduct).delete(deleteOrder);

export default router;
