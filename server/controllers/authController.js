// server/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

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


export const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    
    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("User already exists.");

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

    // 4. Create user with the new fields
    const user = await User.create({ 
      email, 
      password: hashedPassword, 
      firstName, 
      lastName,
      username,       // Added from your new model
      profilePicture: profilePictureUrl // The URL from Cloudinary
    });

    // 5. Create Token & Cookie (Same as before)
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
        firstName: user.firstName
      } 
    });
    
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return res.status(400).send("Invalid Password");

    const token = createToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({ 
      user: { id: user._id, email: user.email, firstName: user.firstName } 
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