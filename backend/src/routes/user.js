import express from "express";
import { supabase, generateUploadUrl } from "../services/dbService.js";

const router = express.Router();

// Generate Signed Upload URL for Recordings
router.post("/upload-url", async (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) return res.status(400).json({ error: "fileName required" });
        
        // This endpoint is protected by ClerkExpressWithAuth
        const data = await generateUploadUrl('recordings', fileName);
        if (!data) throw new Error("Could not generate URL");
        
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate upload URL" });
    }
});

// Get meeting history
router.get("/history", async (req, res) => {
    try {
        const clerkUserId = req.auth.userId; // Provided by ClerkExpressWithAuth

        // Find calls where user was caller OR participant
        const { data: calls, error } = await supabase
            .from('calls')
            .select(`
                id,
                room_id,
                started_at,
                duration,
                call_type,
                status
            `)
            .or(`caller_id.eq.${clerkUserId}`)
            .order('started_at', { ascending: false });

        // Wait, for participants we should join with call_participants
        // For simplicity let's just use caller_id for now, or fetch from both.
        // A better query: calls where caller_id = me OR id in (select call_id from call_participants where clerk_user_id = me)
        
        // Actually Supabase allows querying joined tables
        const { data: participantCalls, error: pError } = await supabase
            .from('call_participants')
            .select('calls(id, room_id, started_at, duration, call_type, status)')
            .eq('clerk_user_id', clerkUserId);
            
        let allCalls = [...(calls || [])];
        if (participantCalls) {
            participantCalls.forEach(p => {
                if (p.calls && !allCalls.find(c => c.id === p.calls.id)) {
                    allCalls.push(p.calls);
                }
            });
        }
        
        allCalls.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

        res.json({ history: allCalls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Update Profile
router.post("/profile", async (req, res) => {
    try {
        const clerkUserId = req.auth.userId;
        const { bio, status, theme } = req.body;
        
        await supabase
            .from('profiles')
            .update({ bio, status })
            .eq('clerk_user_id', clerkUserId);
            
        if (theme) {
            await supabase
                .from('user_preferences')
                .upsert({ user_id: clerkUserId, theme });
        }
            
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// Get Profile
router.get("/profile", async (req, res) => {
    try {
        const clerkUserId = req.auth.userId;
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single();
            
        const { data: prefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', clerkUserId)
            .single();
            
        res.json({ profile: profile || {}, preferences: prefs || {} });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

export default router;
