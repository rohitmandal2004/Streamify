import "dotenv/config";
import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("CRITICAL: MONGO_URI is not defined in environment variables!");
            throw new Error("MONGO_URI environment variable is missing");
        }

        const maskedUri = uri.replace(/\/\/.*:.*@/, "//****:****@");
        console.log(`Attempting to connect to MongoDB with URI: ${maskedUri}`);

        const connectionDb = await mongoose.connect(uri);
        console.log(`✅ MONGO Connected. Host: ${connectionDb.connection.host}`);
    } catch (e) {
        console.error("❌ MONGODB CONNECTION ERROR:", e.message);
        if (e.message.includes("authentication failed")) {
            console.error("TIP: Double check your MongoDB Atlas username and password in the .env file.");
        }
        process.exit(1);
    }

    server.listen(app.get("port"), () => {
        console.log("LISTENING ON PORT 8000")
    });
}

start();