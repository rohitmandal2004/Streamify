import React from 'react';
import withAuth from '../utils/withAuth';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';

function SettingsPage() {
    const { userData, handleLogout } = useContext(AuthContext);
    const [open, setOpen] = useState(true);

    const links = [
        { label: "Dashboard", href: "/home", icon: <LayoutDashboard className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "History", href: "/history", icon: <UserCog className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "Calendar", href: "/calendar", icon: <CalendarDays className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "Settings", href: "/settings", icon: <Settings className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "Logout", href: "#", onClick: handleLogout, icon: <LogOut className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
    ];

    return (
        <div className={cn("flex flex-col md:flex-row bg-[#0B0D17] w-full flex-1 overflow-hidden h-screen text-white")}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-black/40 backdrop-blur-xl border-r border-white/10 relative z-50">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="flex items-center space-x-2 py-1 pr-6 relative z-20 min-w-max">
                            <Logo size="sm" clickable={true} />
                        </div>
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} className="[&>span]:text-gray-300 hover:[&>span]:text-white [&>svg]:text-gray-300 hover:[&>svg]:text-white" />
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
                            className="[&>span]:text-gray-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1 overflow-y-auto w-full p-8 flex-col bg-transparent relative z-10">
                <h1 className="text-4xl font-bold mb-8">Settings</h1>
                <div className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 max-w-2xl">
                    <p className="text-gray-400 mb-6">Manage your account settings and preferences.</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h3 className="font-semibold text-white">Dark Mode</h3>
                                <p className="text-sm text-gray-400">Application appears in dark theme</p>
                            </div>
                            <div className="w-12 h-6 bg-indigo-500 rounded-full flex items-center p-1 cursor-not-allowed opacity-50">
                                <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h3 className="font-semibold text-white">Email Notifications</h3>
                                <p className="text-sm text-gray-400">Receive alerts on upcoming meetings</p>
                            </div>
                            <div className="w-12 h-6 bg-gray-600 rounded-full flex items-center p-1 cursor-not-allowed opacity-50">
                                <div className="w-4 h-4 bg-gray-400 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(SettingsPage);
