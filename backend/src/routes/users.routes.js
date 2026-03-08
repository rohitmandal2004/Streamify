import { Router } from "express";
import { addToHistory, getUserHistory, login, register, googleAuth, reportUser, updateProfile } from "../controllers/user.controller.js";



const router = Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/google-auth").post(googleAuth)
router.route("/report").post(reportUser)
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)
router.route("/profile").put(updateProfile)

export default router;