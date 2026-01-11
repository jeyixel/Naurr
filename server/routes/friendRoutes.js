import { Router } from "express";
import { addFriend } from "../controllers/friendController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const friendRoutes = Router();

// Route: /api/friends/add
friendRoutes.post("/add", verifyToken, addFriend);

export default friendRoutes;