import express from "express"
import { checkAuth, login, signup, updateProfile, forgotPassword, resetPassword, sendSignupOTP, verifySignupOTP } from "../controllers/userController.js"
import { protectRoute } from "../middleware/auth.js"

let userRouter = express.Router()

userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.put("/update-profile", protectRoute, updateProfile)
userRouter.get("/check", protectRoute, checkAuth)
userRouter.post("/forgot-password", forgotPassword)
userRouter.post("/reset-password", resetPassword)
userRouter.post("/send-signup-otp", sendSignupOTP)
userRouter.post("/verify-signup-otp", verifySignupOTP)

export default userRouter