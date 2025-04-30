import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/user.controller";
import { formData, upload } from "../middleware/multer.middleware";
import { verifyUser } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get();
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(formData, loginUser);
router.route("/logout").post(verifyUser, logoutUser);

export default router;
