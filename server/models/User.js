// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String, required: true, unique: true, trim: true },
  profilePicture: { type: String },
  bio: { type: String },
});

const User = mongoose.model("User", userSchema); // why create user model? it helps to interact with the users collection in MongoDB

export default User;