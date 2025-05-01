import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessTokenViaRefreshToken,
    getUserInfo,
    deleteUser,
    updateUser,
    changePassword,
} from "../controllers/user.controller";
import { formData, upload } from "../middleware/multer.middleware";
import { verifyUser } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get();
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(formData, loginUser);
router.use(verifyUser);
router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(formData, refreshAccessTokenViaRefreshToken);

router.route("/me").get(getUserInfo).patch(upload.single("avatar"), updateUser).delete(deleteUser);
router.route("/me/password").post(changePassword);

export default router;
