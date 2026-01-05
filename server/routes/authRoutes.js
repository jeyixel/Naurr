import { Router } from "express";
import { signup, login, me, logout, regenerateFriendCode } from "../controllers/authController.js";
import multer from "multer";

const authRoutes = Router();

// Configure Multer to store file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add 'upload.single("profile-image")' middleware to the signup route
// This expects the frontend to send a file field named "profile-image"
authRoutes.post("/signup", upload.single("profile-image"), signup);
authRoutes.post("/login", login);
authRoutes.get("/me", me);
// Regenerate friend code for the authenticated user
authRoutes.put("/regenerate-code", regenerateFriendCode);
authRoutes.post("/logout", logout);

export default authRoutes;