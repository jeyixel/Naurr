// server/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";

// creating a function to create JWT token
const createToken = (id) => {
    // checking if the JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d", // Token valid for 3 days
  });
};

// Friend code system helpers
const generateCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

const generateUniqueFriendCode = async () => {
  let newCode = "";
  let existing = null;

  do {
    newCode = generateCode();
    existing = await User.findOne({ friendCode: newCode }).lean();
  } while (existing);

  return newCode;
};


export const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    const normalizedUsername = (username || "").trim();

    if (!normalizedUsername) {
      return res.status(400).json({ message: "Username is required" });
    }

    // 1. Check if email or username already exist
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username: normalizedUsername }),
    ]);

    if (existingEmail) return res.status(400).json({ message: "Email already in use" });
    if (existingUsername) return res.status(400).json({ message: "Username already in use" });

    // 2. Handle Image Upload (if a file was sent)
    let profilePictureUrl = "";
    if (req.file) { // what is the point of this condition? to check if a file is uploaded
      // Upload to Cloudinary using a stream (since file is in memory)
      const b64 = Buffer.from(req.file.buffer).toString("base64"); // convert buffer to base64 string
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64; // create data URI
      
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "chat-app-uploads", // Optional: organize in a folder
      });
      profilePictureUrl = cldRes.secure_url;
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Generate a friend code (best effort, falls back to login assignment if it fails)
    const friendCode = await generateUniqueFriendCode();

    // 5. Create user with the new fields
    const user = await User.create({ 
      email, 
      password: hashedPassword, 
      firstName, 
      lastName,
      username: normalizedUsername, // enforce trimmed, unique usernames
      profilePicture: profilePictureUrl, // The URL from Cloudinary
      friendCode,
    });

    // 6. Create Token & Cookie (Same as before)
    const token = createToken(user._id);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(201).json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        username: user.username,
        friendCode: user.friendCode,
      } 
    });
    
  } catch (err) {
    console.log(err);
    // Handle duplicate key error (11000)
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(409).json({ message: `${field} already in use` });
    }
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Email, username, and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    if (user.username !== username) {
      return res.status(400).json({ message: "Username does not match this account" });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return res.status(400).send("Invalid Password");

    // Ensure the user always has a friend code when logging in
    if (!user.friendCode) {
      user.friendCode = await generateUniqueFriendCode();
      await user.save();
    }

    const token = createToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        firstName: user.firstName, 
        username: user.username,
        friendCode: user.friendCode,
        profilePicture: user.profilePicture,
      } 
    });
    
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const me = async (req, res) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).send("Not authenticated");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).send("User not found");

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("jwt", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax" });
  return res.sendStatus(200);
};

export const regenerateFriendCode = async (req, res) => {
  try {
    const userId = req.user.id; // From your verifyToken middleware
    const newCode = await generateUniqueFriendCode();

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { friendCode: newCode },
      { new: true }
    );

    res.status(200).json({ 
      message: "Friend code updated successfully", 
      newFriendCode: updatedUser.friendCode 
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};