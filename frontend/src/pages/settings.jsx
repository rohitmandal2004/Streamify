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

    const [settings, setSettings] = useState({
        darkMode: localStorage.getItem('globalDarkMode') !== 'false',
        emailNotifications: localStorage.getItem('globalEmailNotifs') === 'true',
        limitData: localStorage.getItem('globalLimitData') === 'true',
        leaveEmpty: localStorage.getItem('globalLeaveEmpty') !== 'false',
        onTheGo: localStorage.getItem('globalOnTheGo') !== 'false',
        translateSpeech: localStorage.getItem('globalTranslateSpeech') === 'true',
    });

    const handleToggle = (key) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        
        // Persist to localStorage (mapping keys to actual localstorage keys)
        const storageMap = {
            darkMode: 'globalDarkMode',
            emailNotifications: 'globalEmailNotifs',
            limitData: 'globalLimitData',
            leaveEmpty: 'globalLeaveEmpty',
            onTheGo: 'globalOnTheGo',
            translateSpeech: 'globalTranslateSpeech'
        };
        localStorage.setItem(storageMap[key], newValue.toString());
    };

    const Toggle = ({ checked, onChange }) => (
        <div 
            onClick={onChange}
            className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-indigo-500' : 'bg-gray-600'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    );

    return (
        <div className={cn("flex flex-col md:flex-row bg-[#0B0D17] w-full flex-1 overflow-hidden h-screen text-white")}>
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
            <div className="flex flex-1 overflow-y-auto w-full p-8 flex-col bg-transparent relative z-10">
                <h1 className="text-4xl font-bold mb-8">Settings</h1>
                
                <div className="grid gap-6 max-w-3xl">
                    {/* General Section */}
                    <div className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                        <h2 className="text-xl font-bold mb-6 text-indigo-400">General</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-semibold text-white">Dark Mode</h3>
                                    <p className="text-sm text-gray-400">Application appears in dark theme</p>
                                </div>
                                <Toggle checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-semibold text-white">Email Notifications</h3>
                                    <p className="text-sm text-gray-400">Receive alerts on upcoming meetings</p>
                                </div>
                                <Toggle checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-semibold text-white">Limit data usage</h3>
                                    <p className="text-sm text-gray-400">Adjusts call quality to save data</p>
                                </div>
                                <Toggle checked={settings.limitData} onChange={() => handleToggle('limitData')} />
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-semibold text-white">Leave empty calls</h3>
                                    <p className="text-sm text-gray-400">Removes you from a call after a few minutes if no one else joins</p>
                                </div>
                                <Toggle checked={settings.leaveEmpty} onChange={() => handleToggle('leaveEmpty')} />
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-semibold text-white">Automatically use On the go</h3>
                                    <p className="text-sm text-gray-400">Suggests to use On the go mode when your device is moving</p>
                                </div>
                                <Toggle checked={settings.onTheGo} onChange={() => handleToggle('onTheGo')} />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <div>
                                    <h3 className="font-semibold text-white">Translate what you say for others</h3>
                                    <p className="text-sm text-gray-400">Allow real-time speech translation</p>
                                </div>
                                <Toggle checked={settings.translateSpeech} onChange={() => handleToggle('translateSpeech')} />
                            </div>
                        </div>
                    </div>

                    {/* Privacy & Security Section */}
                    <div className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                        <h2 className="text-xl font-bold mb-6 text-red-400">Privacy & Security</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-semibold text-white">Blocked Users</h3>
                                    <p className="text-sm text-gray-400">Manage users you have blocked from joining your meetings</p>
                                </div>
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                                    Manage
                                </button>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <div>
                                    <h3 className="font-semibold text-white">Send diagnostic info</h3>
                                    <p className="text-sm text-gray-400">Help improve Streamify by sending crash reports</p>
                                </div>
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                                    View Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(SettingsPage, 'settings');
