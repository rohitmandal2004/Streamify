import mongoose, { Schema } from "mongoose";

const userScheme = new Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for OAuth users
        email: { type: String, unique: true, sparse: true }, // Optional, unique when provided
        authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
        profileImage: { type: String },
        token: { type: String },
        createdAt: { type: Date, default: Date.now }
    }
)

const User = mongoose.model("User", userScheme);

export { User };