// server/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
    // for profile picture im gonna be using cloudinary, wonder if this is the right way
    const { email, password, firstName, lastName, username, profilePicture, bio } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email }); // what is this findOne method? it searches the database for a user with the given email
    if (existingUser) return res.status(400).send("User already exists.");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (include optional fields if provided)
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username: username || undefined,
      profilePicture: profilePicture || undefined,
      bio: bio || undefined,
    });

    // Create Token
    const token = createToken(user._id);

    const isProduction = process.env.NODE_ENV === "production"; // check if in production mode

    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });


    return res.status(201).json({ 
      user: { id: user._id, email: user.email, firstName: user.firstName } 
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