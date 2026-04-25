import express from 'express';
import { sendMeetingConfirmation } from '../services/emailService.js';

const router = express.Router();

router.post('/send-confirmation', async (req, res) => {
    try {
        const { userEmail, meetingName, scheduledTime, meetingLink } = req.body;
        
        if (!userEmail || !scheduledTime || !meetingLink) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await sendMeetingConfirmation(userEmail, meetingName || 'Scheduled Meeting', scheduledTime, meetingLink);
        
        res.status(200).json({ success: true, message: 'Confirmation email sent' });
    } catch (error) {
        console.error('Error in /send-confirmation route:', error);
        res.status(500).json({ error: 'Failed to send confirmation email' });
    }
});

export default router;
