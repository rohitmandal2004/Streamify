import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
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
        router("/auth");
    }

    const getHistoryOfUser = async () => {
        if (!user) return [];
        try {
            const { data, error } = await supabase
                .from('meeting_history')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Fetch history error", err);
            return [];
        }
    }

    const addToUserHistory = async (meetingCode) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('meeting_history')
                .insert([
                    { user_id: user.id, meeting_code: meetingCode }
                ])
                .select('*');
            if (error) throw error;
            if (data && data.length > 0) return data[0];
            return data;
        } catch (err) {
            console.error("Add history error", err);
        }
    }

    const updateMeetingDuration = async (historyId, duration) => {
        if (!user || !historyId) return;
        try {
            const { error } = await supabase
                .from('meeting_history')
                .update({ duration: duration })
                .eq('id', historyId)
                .eq('user_id', user.id);
            if (error) throw error;
        } catch (err) {
            console.error("Update duration error", err);
        }
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
