import cron from 'node-cron';
import { supabase } from '../utils/supabase.js';
import { sendMeetingReminder } from '../services/emailService.js';

// Run every minute
export const startReminderCron = () => {
    cron.schedule('* * * * *', async () => {
        try {
            // Calculate time window: Now to Now + 30 minutes
            const now = new Date();
            const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000);

            const { data: meetings, error } = await supabase
                .from('scheduled_meetings')
                .select('*')
                .eq('reminder_sent', false)
                .gte('scheduled_time', now.toISOString())
                .lte('scheduled_time', thirtyMinsFromNow.toISOString());

            if (error) throw error;

            if (meetings && meetings.length > 0) {
                console.log(`Found ${meetings.length} meetings starting in <= 30 mins to send reminders for.`);
                
                for (const meeting of meetings) {
                    try {
                        await sendMeetingReminder(
                            meeting.user_email,
                            meeting.meeting_name || 'Scheduled Meeting',
                            meeting.scheduled_time,
                            `/${meeting.meeting_code}`
                        );

                        // Mark as sent
                        await supabase
                            .from('scheduled_meetings')
                            .update({ reminder_sent: true })
                            .eq('id', meeting.id);
                            
                        console.log(`Sent reminder for meeting ${meeting.meeting_code} to ${meeting.user_email}`);
                    } catch (emailError) {
                        console.error(`Failed to send reminder for meeting ${meeting.id}:`, emailError);
                    }
                }
            }
        } catch (error) {
            console.error('Error in reminder cron job:', error);
        }
    });
    
    console.log('Meeting reminder cron job started');
};
