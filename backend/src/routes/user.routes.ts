import { Router } from "express";
import {
    changePassword,
    deleteUser,
    getOrderHistory,
    getUserInfo,
    loginUser,
    logoutUser,
    refreshAccessTokenViaRefreshToken,
    registerUser,
    updateUser,
} from "../controllers/user.controller";
import { verifyUser } from "../middleware/auth.middleware";
import { formData, upload } from "../middleware/multer.middleware";
import {
    authLimiter,
    generalLimiter,
    refreshTokenLimiter,
    userLimiter,
    userPasswordChangeLimiter,
} from "../utils/rateLimiter";

const router = Router();

router
    .route("/register")
    .post(authLimiter, upload.single("avatar"), registerUser);
router.route("/login").post(authLimiter, formData, loginUser);
router.use(verifyUser);
router.route("/logout").post(generalLimiter, logoutUser);
router
    .route("/refresh-token")
    .post(refreshTokenLimiter, formData, refreshAccessTokenViaRefreshToken);

router
    .use(userLimiter)
    .route("/me")
    .get(getUserInfo)
    .patch(upload.single("avatar"), updateUser)
    .delete(deleteUser);
router
    .route("/me/password")
    .patch(userPasswordChangeLimiter, formData, changePassword);
router.route("/orderHistory").get(generalLimiter, getOrderHistory);
export default router;
