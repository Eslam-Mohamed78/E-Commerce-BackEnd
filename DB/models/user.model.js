import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: String,
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    forgetCode: String,
    activationCode: String,

    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dayeympjm/image/upload/v1691408996/ecommerceDefaults/user/avatar-_cbtazq.jpg",
      },
      id: {
        type: String,
        default: "ecommerceDefaults/user/avatar-_cbtazq",
      },
    },
    coverImage: [
      {
        url: { type: String, required: true },
        id: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.model.User || model("User", userSchema);

export default userModel;
