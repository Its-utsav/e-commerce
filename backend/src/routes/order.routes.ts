import { Router } from "express";
import {
    cancelOrder,
    getOrderDetails,
    getOrderHistoryDetails,
    makeAPayment,
    placeNewOrder,
} from "../controllers/order.controller";
import { verifyUser } from "../middleware/auth.middleware";
import { formData } from "../middleware/multer.middleware";
import { orderLimiter } from "../utils/rateLimiter";

const router = Router();

router.use(orderLimiter, verifyUser, formData);

router.route("/").get(getOrderHistoryDetails).post(placeNewOrder);
router.route("/:orderId").get(getOrderDetails);
router.route("/:orderId/cancel").patch(cancelOrder);
router.route("/:orderId/pay").post(makeAPayment);

export default router;
