import "dotenv/config";
import express from "express";
import { createServer } from "node:http";

import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import emailRoutes from "./routes/email.js";
import { startReminderCron } from "./cron/reminders.js";

import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Protected Routes Middleware
app.use("/api", ClerkExpressWithAuth()); 

import userRoutes from "./routes/user.js";

// Routes
app.use("/api/email", emailRoutes);
app.use("/api/user", userRoutes);

// Start Cron Jobs
startReminderCron();

const start = async () => {
    server.listen(app.get("port"), () => {
        console.log(`SOCKET SIGNALING SERVER LISTENING ON PORT ${app.get("port")}`)
    });
}

start();