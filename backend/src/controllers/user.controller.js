import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"

import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";
const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        // Skip password check for OAuth users
        if (user.authProvider === 'google') {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Please sign in with Google" })
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { name, username, password } = req.body;


    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }

}


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

// Helper function to generate unique username from email
const generateUsernameFromEmail = async (email) => {
    // Extract username part before @
    let baseUsername = email.split('@')[0].toLowerCase();
    // Remove any special characters, keep only alphanumeric
    baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');
    
    let username = baseUsername;
    let counter = 1;
    
    // Check if username exists, if so append number
    while (await User.findOne({ username })) {
        username = `${baseUsername}_${counter}`;
        counter++;
    }
    
    return username;
}

// Google OAuth authentication
const googleAuth = async (req, res) => {
    const { name, email, profileImage, googleId } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        // Check if user exists by email
        let user = await User.findOne({ email });

        if (user) {
            // User exists, generate new token and return
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            // Update profile image if provided
            if (profileImage) {
                user.profileImage = profileImage;
            }
            await user.save();
            return res.status(httpStatus.OK).json({ 
                token: token,
                user: {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage
                }
            });
        } else {
            // New user, create account
            const username = await generateUsernameFromEmail(email);
            let token = crypto.randomBytes(20).toString("hex");

            const newUser = new User({
                name: name,
                username: username,
                email: email,
                authProvider: 'google',
                profileImage: profileImage || '',
                token: token
            });

            await newUser.save();

            return res.status(httpStatus.CREATED).json({ 
                token: token,
                user: {
                    name: newUser.name,
                    username: newUser.username,
                    email: newUser.email,
                    profileImage: newUser.profileImage
                }
            });
        }
    } catch (e) {
        console.error('Google auth error:', e);
        return res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
}


import { Report } from "../models/report.model.js";

// Report Abuse
const reportUser = async (req, res) => {
    const { reporterId, reportedId, roomCode, reason, description } = req.body;

    if (!reporterId || !reportedId || !roomCode || !reason) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Missing required fields" });
    }

    try {
        const newReport = new Report({
            reporterId,
            reportedId,
            roomCode,
            reason,
            description
        });

        await newReport.save();

        res.status(httpStatus.CREATED).json({ message: "Report submitted successfully" });
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Error submitting report: ${e.message}` });
    }
}

export { login, register, getUserHistory, addToHistory, googleAuth, reportUser }