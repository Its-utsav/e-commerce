import { Router } from "express";
import {
    changePassword,
    deleteUser,
    getUserInfo,
    loginUser,
    logoutUser,
    refreshAccessTokenViaRefreshToken,
    registerUser,
    updateUser,
    getOrderHistory,
} from "../controllers/user.controller";
import { verifyUser } from "../middleware/auth.middleware";
import { formData, upload } from "../middleware/multer.middleware";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(formData, loginUser);
router.use(verifyUser);
router.route("/logout").post(logoutUser);
router
    .route("/refresh-token")
    .post(formData, refreshAccessTokenViaRefreshToken);

router
    .route("/me")
    .get(getUserInfo)
    .patch(upload.single("avatar"), updateUser)
    .delete(deleteUser);
router.route("/me/password").patch(formData, changePassword);
router.route("/orderHistory").get(getOrderHistory);
export default router;
