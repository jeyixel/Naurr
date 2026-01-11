// server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose"; // Import mongoose
import authRoutes from "./routes/authRoutes.js"; // Import routes
import friendRoutes from "./routes/friendRoutes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
// checking if DB_URI is defined
if (!process.env.DB_URI) {
    console.error("DB_URI is not defined in the environment variables.");
    process.exit(1);
}

// just in case the user forgets to set the DB_URI
if (process.env.DB_URI == "mongodb+srv://<your_connection_string>"){
    console.error("🚨 Bro, your mongodb URL is a blank placeholder, please change it now.🚨🤣");
    process.exit(1);
}

const DB_URI = process.env.DB_URI; // Add this to your .env file!

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true // Crucial for cookies!
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Prefix all auth routes with /api/auth
app.use("/api/friends", friendRoutes); // Prefix all friend routes with /api/friends

mongoose
  .connect(DB_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err.message));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));