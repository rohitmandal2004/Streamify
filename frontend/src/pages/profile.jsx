import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Camera, User, Mail, Phone, Save } from "lucide-react";
import { Component as EtheralShadow } from '../components/ui/etheral-shadow';

function ProfilePage() {
    const { userData, handleProfileUpdate } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // User data states
    const [email, setEmail] = useState(userData?.email || "");
    const [phone, setPhone] = useState(userData?.phone || "");
    const [profileImage, setProfileImage] = useState(userData?.profileImage || "");
    const [previewImage, setPreviewImage] = useState(userData?.profileImage || "");

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });
        try {
            await handleProfileUpdate(email, phone, profileImage);
            setMessage({ text: "Profile updated successfully!", type: "success" });
            setIsEditing(false);
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || "Failed to update profile",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        // Here we just use an image URL input for simplicity instead of file upload, 
        // to match standard avatar mockups
        const url = e.target.value;
        setProfileImage(url);
        setPreviewImage(url);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-col flex-1 h-screen relative bg-transparent overflow-y-auto">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-900/40 to-transparent pointer-events-none -z-10"></div>

            <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 relative z-10 pt-20">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                        <User className="h-8 w-8 text-indigo-400" />
                        My Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your personal information and avatar</p>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                    <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center relative">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 border-4 border-indigo-500/30 shadow-xl">
                                <AvatarImage src={previewImage || ""} alt={userData?.name || "User"} />
                                <AvatarFallback className="text-4xl bg-indigo-950 text-indigo-200">
                                    {getInitials(userData?.name || userData?.username)}
                                </AvatarFallback>
                            </Avatar>

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20">
                                    <Camera className="h-8 w-8 text-white mb-1" />
                                    <span className="text-xs text-white uppercase tracking-wider font-semibold">Change</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <h2 className="text-2xl font-bold text-white">{userData?.name || "Guest User"}</h2>
                            <p className="text-indigo-400 font-medium">@{userData?.username}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="p-8 space-y-6">

                        {isEditing && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Camera className="h-4 w-4" /> Avatar Image URL
                                </label>
                                <input
                                    type="text"
                                    value={profileImage}
                                    onChange={handleImageChange}
                                    placeholder="https://example.com/avatar.png"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500">Provide a direct link to an image (e.g., Unsplash, Imgur)</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Enter your email"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
                            {isEditing ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEmail(userData?.email || "");
                                            setPhone(userData?.phone || "");
                                            setProfileImage(userData?.profileImage || "");
                                            setPreviewImage(userData?.profileImage || "");
                                            setMessage({ text: "", type: "" });
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="gap-2">
                                        {loading ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default withAuth(ProfilePage);
