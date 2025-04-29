import { Router } from "express";
import { registerUser } from "../controllers/user.controller";
import { upload } from "../middleware/multer.middleware";

const router = Router();

router.route("/").get();
router.route("/register").post(upload.single("avatar"), registerUser);

export default router;
