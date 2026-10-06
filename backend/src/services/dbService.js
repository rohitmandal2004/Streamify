import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const syncUserProfile = async (clerkUser) => {
    try {
        const { id, username, first_name, last_name, email_addresses, image_url } = clerkUser;
        const email = email_addresses[0]?.email_address;
        const display_name = `${first_name || ''} ${last_name || ''}`.trim();

        const { error } = await supabase
            .from('profiles')
            .upsert({
                clerk_user_id: id,
                username: username || id,
                display_name,
                email,
                avatar_url: image_url,
                updated_at: new Date().toISOString()
            });
            
        if (error) console.error("Error syncing profile:", error);
    } catch (err) {
        console.error("Sync Profile Error:", err);
    }
};

export const startMeeting = async (roomId, callerId, callType = 'video') => {
    try {
        const { data, error } = await supabase
            .from('calls')
            .insert({
                room_id: roomId,
                caller_id: callerId,
                call_type: callType,
                status: 'ongoing'
            })
            .select('id')
            .single();
            
        if (error) throw error;
        return data.id;
    } catch (err) {
        console.error("Start Meeting Error:", err);
        return null;
    }
};

export const joinMeeting = async (callId, clerkUserId) => {
    try {
        await supabase
            .from('call_participants')
            .insert({
                call_id: callId,
                clerk_user_id: clerkUserId
            });
    } catch (err) {
        console.error("Join Meeting Error:", err);
    }
};

export const endMeeting = async (callId) => {
    try {
        await supabase
            .from('calls')
            .update({
                status: 'ended',
                ended_at: new Date().toISOString()
            })
            .eq('id', callId);
    } catch (err) {
        console.error("End Meeting Error:", err);
    }
};

export const saveMessage = async (roomId, senderId, message, type = 'text') => {
    try {
        await supabase
            .from('messages')
            .insert({
                room_id: roomId,
                sender_id: senderId,
                message,
                message_type: type
            });
    } catch (err) {
        console.error("Save Message Error:", err);
    }
};

export const generateUploadUrl = async (bucket, path) => {
    try {
        const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Generate Upload URL Error:", err);
        return null;
    }
};
