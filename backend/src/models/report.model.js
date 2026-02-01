import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema({
    reporterId: { type: String, required: true }, // Username or User ID
    reportedId: { type: String, required: true }, // Username or User ID of the offender
    roomCode: { type: String, required: true },
    reason: { type: String, required: true, enum: ['harassment', 'spam', 'inappropriate', 'other'] },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
});

const Report = mongoose.model("Report", reportSchema);

export { Report };
