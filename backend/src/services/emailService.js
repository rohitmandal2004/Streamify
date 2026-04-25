import { Resend } from 'resend';

// Uses Resend API key from environment variables
// Note: onboarding@resend.dev only works for sending emails to the verified email address on the Resend account.
// For production, a verified domain is required.
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMeetingConfirmation = async (userEmail, meetingName, scheduledTime, meetingLink) => {
    try {
        const data = await resend.emails.send({
            from: 'Streamify <onboarding@resend.dev>', 
            to: userEmail,
            subject: `Meeting Scheduled: ${meetingName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Your Meeting is Scheduled!</h2>
                    <p><strong>Meeting Name:</strong> ${meetingName}</p>
                    <p><strong>Scheduled For:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
                    <div style="margin-top: 30px; margin-bottom: 30px;">
                        <a href="${process.env.FRONTEND_URL}${meetingLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Meeting</a>
                    </div>
                    <p style="color: #ccc;">We'll send you a reminder 30 minutes before the meeting starts.</p>
                </div>
            `,
        });
        return data;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw error;
    }
};

export const sendMeetingReminder = async (userEmail, meetingName, scheduledTime, meetingLink) => {
    try {
        const data = await resend.emails.send({
            from: 'Streamify <onboarding@resend.dev>',
            to: userEmail,
            subject: `Reminder: ${meetingName} starts in 30 minutes`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Your meeting is starting soon!</h2>
                    <p><strong>Meeting Name:</strong> ${meetingName}</p>
                    <p><strong>Scheduled For:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
                    <div style="margin-top: 30px; margin-bottom: 30px;">
                        <a href="${process.env.FRONTEND_URL}${meetingLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Meeting</a>
                    </div>
                    <p style="color: #ccc;">Get ready!</p>
                </div>
            `,
        });
        return data;
    } catch (error) {
        console.error('Error sending reminder email:', error);
        throw error;
    }
};
