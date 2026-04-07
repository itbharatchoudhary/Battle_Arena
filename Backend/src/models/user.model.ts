import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  plan: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free"
  },
  avatar: {
    type: String,
    default: "👤"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);