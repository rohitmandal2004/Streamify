import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Camera, User, Mail, Phone, Save } from "lucide-react";
import Logo from '../components/Logo';
import UserDropdown from '../components/UserDropdown';
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays, Star } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from 'framer-motion';

function ProfilePage() {
    const { userData, handleProfileUpdate, handleLogout } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [open, setOpen] = useState(true);

    // User data states
    const [email, setEmail] = useState(userData?.email || "");
    const [phone, setPhone] = useState(userData?.phone || "");
    const [profileImage, setProfileImage] = useState(userData?.profileImage || "");
    const [previewImage, setPreviewImage] = useState(userData?.profileImage || "");

    const links = [
        {
            label: "Dashboard",
            href: "/home",
            icon: (
                <LayoutDashboard className="text-gray-300 h-5 w-5 flex-shrink-0" />
            ),
        },

        {
            label: "History",
            href: "/history",
            icon: (
                <UserCog className="text-gray-300 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Calendar",
            href: "/calendar",
            icon: (
                <CalendarDays className="text-gray-300 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Settings",
            href: "/settings",
            icon: (
                <Settings className="text-gray-300 h-5 w-5 flex-shrink-0" />
            ),
        },

        {
            label: "Logout",
            href: "#",
            onClick: handleLogout,
            icon: (
                <LogOut className="text-gray-300 h-5 w-5 flex-shrink-0" />
            ),
        },
    ];

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
        <div className={cn("flex flex-col md:flex-row bg-[#000000] w-full flex-1 overflow-hidden h-screen text-white")}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-[#0a0a0f]/80 backdrop-blur-2xl border-r border-white/[0.06] relative z-50">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="flex items-center space-x-2 py-1 pr-6 relative z-20 min-w-max">
                            <Logo size="sm" clickable={true} />
                        </div>
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: userData?.name || "User",
                                href: "/profile",
                                icon: (
                                    <Avatar className="h-7 w-7 flex-shrink-0 border border-white/10">
                                        <AvatarImage src={userData?.profileImage || ""} alt={userData?.name} />
                                        <AvatarFallback className="text-[10px] bg-indigo-500 text-white font-bold">
                                            {userData?.name ? userData.name[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                ),
                            }}
                            className="border-t border-white/[0.04] pt-4 mt-2"
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            <div className="flex flex-1 overflow-y-auto w-full relative h-screen">
                <div className="min-h-full bg-transparent relative flex flex-col w-full">
                    {/* Background Gradients */}
                    <div className="fixed inset-0 z-0 bg-black pointer-events-none w-full h-full">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                    </div>

                    {/* Navbar - Mobile Optimized */}
                    <motion.nav
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 md:hidden"
                        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center"><Logo size="sm" clickable={true} /></div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <UserDropdown userInitial={userData?.name ? userData.name[0] : "U"} />
                        </div>
                    </motion.nav>

                    <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 relative z-10 pt-8 md:pt-20">
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
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50"
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
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
                                    {isEditing ? (
                                        <>
                                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                                        </>
                                    ) : (
                                        <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(ProfilePage, 'profile');
