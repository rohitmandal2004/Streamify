import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const router = useNavigate();
    
    // Maps Clerk's user object to the legacy userData object format expected by components
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            // Check if there is already a token in localStorage, we can use clerk's own session mechanisms now but we'll leave it for backwards compat.
            localStorage.setItem("token", "clerk_session_token"); 

            setUserData({
                id: user.id,
                name: user.fullName || user.firstName,
                username: user.username || user.emailAddresses[0].emailAddress,
                profileImage: user.imageUrl,
                email: user.emailAddresses[0].emailAddress
            });
        } else if (isLoaded && !isSignedIn) {
            setUserData(null);
            localStorage.removeItem("token");
        }
    }, [user, isLoaded, isSignedIn]);

    // Legacy functions - these are mostly handled by Clerk natively on /auth now
    const handleRegister = async () => {};
    const handleLogin = async () => {};
    const handleGoogleAuth = async () => {};

    const handleLogout = async () => {
        await signOut();
        router("/sign-in");
    }

    const { getToken } = useAuth(); // Import useAuth at the top

    const getHistoryOfUser = async () => {
        if (!user) return [];
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/user/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            
            // Map the data back to the format expected by history.jsx
            return data.history.map(item => ({
                id: item.id,
                meetingCode: item.room_id,
                date: item.started_at,
                duration: item.duration || 0
            }));
        } catch (err) {
            console.error("Fetch history error", err);
            return [];
        }
    }

    const scheduleMeeting = async (meetingDetails) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('scheduled_meetings')
                .insert([
                    { 
                        user_id: user.id, 
                        meeting_code: meetingDetails.meetingCode,
                        meeting_name: meetingDetails.meetingName,
                        scheduled_time: meetingDetails.scheduledTime,
                        user_email: user.emailAddresses[0].emailAddress
                    }
                ])
                .select('*');
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error("Schedule meeting error", err);
            throw err;
        }
    }

    const getScheduledMeetings = async () => {
        if (!user) return [];
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('scheduled_meetings')
                .select('*')
                .eq('user_id', user.id)
                .gte('scheduled_time', now) // Only get future meetings
                .order('scheduled_time', { ascending: true });
            
            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Fetch scheduled meetings error", err);
            return [];
        }
    }

    const addToUserHistory = async (meetingCode) => {
        // Now handled by the backend automatically when connecting to Socket.io
        return { success: true };
    }

    const updateMeetingDuration = async (historyId, duration) => {
        // Backend handles duration when meeting ends
        return { success: true };
    }

    const reportUser = async (data) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('reports')
                .insert([
                    { user_id: user.id, ...data }
                ]);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error("Report user error", err);
        }
    }

    const cancelScheduledMeeting = async (meetingCode) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('scheduled_meetings')
                .delete()
                .eq('user_id', user.id)
                .eq('meeting_code', meetingCode);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error("Cancel meeting error", err);
            throw err;
        }
    }

    const handleProfileUpdate = async (email, phone, profileImage) => {
        // Mock method since updates are usually handled via Clerk user profile, but this prevents errors if called
        return { success: true };
    }

    const contextData = {
        userData, 
        setUserData, 
        addToUserHistory, 
        updateMeetingDuration,
        getHistoryOfUser, 
        scheduleMeeting,
        getScheduledMeetings,
        cancelScheduledMeeting,
        handleRegister, 
        handleLogin, 
        handleGoogleAuth, 
        reportUser, 
        handleLogout, 
        handleProfileUpdate
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
}
