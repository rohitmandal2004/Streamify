import React, { useContext, useState, useEffect, useCallback } from 'react';
import withAuth from '../utils/withAuth';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays, X, Trash2, Shield, Bug, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { AuthContext } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';
import UserDropdown from '../components/UserDropdown';
import { motion, AnimatePresence } from 'framer-motion';

function SettingsPage() {
    const { userData, handleLogout } = useContext(AuthContext);
    const [open, setOpen] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [blockedModalOpen, setBlockedModalOpen] = useState(false);
    const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('blockedUsers') || '[]'); } catch { return []; }
    });

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

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    // Apply dark mode effect on the document
    useEffect(() => {
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, [settings.darkMode]);

    // Sync limitData with the lowDataMode key that VideoMeet reads
    useEffect(() => {
        localStorage.setItem('lowDataMode', settings.limitData.toString());
    }, [settings.limitData]);

    // Email notification permission
    useEffect(() => {
        if (settings.emailNotifications && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [settings.emailNotifications]);

    const handleToggle = (key) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));

        const storageMap = {
            darkMode: 'globalDarkMode',
            emailNotifications: 'globalEmailNotifs',
            limitData: 'globalLimitData',
            leaveEmpty: 'globalLeaveEmpty',
            onTheGo: 'globalOnTheGo',
            translateSpeech: 'globalTranslateSpeech'
        };
        localStorage.setItem(storageMap[key], newValue.toString());

        // Specific side-effects per setting
        const messages = {
            darkMode: newValue ? 'Dark mode enabled' : 'Dark mode disabled',
            emailNotifications: newValue ? 'Email notifications enabled — you\'ll receive meeting alerts' : 'Email notifications disabled',
            limitData: newValue ? 'Low data mode enabled — video quality reduced to save bandwidth' : 'Full quality video restored',
            leaveEmpty: newValue ? 'Auto-leave enabled — you\'ll leave empty calls after 3 minutes' : 'Auto-leave disabled',
            onTheGo: newValue ? 'On-the-go mode enabled' : 'On-the-go mode disabled',
            translateSpeech: newValue ? 'Speech translation enabled for meetings' : 'Speech translation disabled'
        };
        showToast(messages[key]);
    };

    const handleUnblockUser = (userId) => {
        const updated = blockedUsers.filter(u => u.id !== userId);
        setBlockedUsers(updated);
        localStorage.setItem('blockedUsers', JSON.stringify(updated));
        showToast('User unblocked successfully');
    };

    const getDiagnosticInfo = () => ({
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenRes: `${window.screen.width}x${window.screen.height}`,
        devicePixelRatio: window.devicePixelRatio,
        online: navigator.onLine,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: (() => { try { let s = 0; for (let k in localStorage) { if (localStorage.hasOwnProperty(k)) s += localStorage[k].length; } return `${(s / 1024).toFixed(1)} KB used`; } catch { return 'N/A'; } })(),
        timestamp: new Date().toISOString(),
        appVersion: '2.4.0',
    });

    const Toggle = ({ checked, onChange, disabled }) => (
        <button
            onClick={onChange}
            disabled={disabled}
            className={cn(
                "w-12 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-all duration-300 flex-shrink-0",
                checked ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 'bg-gray-600/80',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            <div className={cn(
                "w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md",
                checked ? 'translate-x-6' : 'translate-x-0'
            )} />
        </button>
    );

    const SettingRow = ({ title, description, checked, onChange, disabled, isLast }) => (
        <div className={cn("flex justify-between items-center py-5", !isLast && "border-b border-white/[0.06]")}>
            <div className="pr-4">
                <h3 className="font-semibold text-white text-[15px]">{title}</h3>
                <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{description}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} disabled={disabled} />
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

            <div className="flex flex-1 flex-col overflow-y-auto w-full bg-transparent relative z-10">
                {/* Mobile Navbar */}
                <motion.nav
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 md:hidden"
                    initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center"><Logo size="sm" clickable={true} /></div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <UserDropdown userInitial={userData?.name ? userData.name[0] : "U"} />
                    </div>
                </motion.nav>

                <div className="flex-1 w-full p-6 sm:p-8 pb-32 md:pb-8">
                    <div className="max-w-3xl mx-auto">
                        <motion.h1
                            className="text-4xl font-bold mb-8"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        >Settings</motion.h1>

                        <div className="grid gap-6">
                            {/* General Section */}
                            <motion.div
                                className="bg-surface/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10"
                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            >
                                <h2 className="text-xl font-bold mb-2 text-indigo-400">General</h2>
                                <p className="text-sm text-gray-500 mb-4">Customize your app experience</p>

                                <SettingRow
                                    title="Dark Mode"
                                    description="Application appears in dark theme"
                                    checked={settings.darkMode}
                                    onChange={() => handleToggle('darkMode')}
                                />
                                <SettingRow
                                    title="Email Notifications"
                                    description="Receive email alerts for upcoming scheduled meetings"
                                    checked={settings.emailNotifications}
                                    onChange={() => handleToggle('emailNotifications')}
                                />
                                <SettingRow
                                    title="Limit data usage"
                                    description="Reduces video quality to 480p/15fps to save bandwidth in calls"
                                    checked={settings.limitData}
                                    onChange={() => handleToggle('limitData')}
                                />
                                <SettingRow
                                    title="Leave empty calls"
                                    description="Automatically leaves a call after 3 minutes if no one else joins"
                                    checked={settings.leaveEmpty}
                                    onChange={() => handleToggle('leaveEmpty')}
                                />
                                <SettingRow
                                    title="Automatically use On the go"
                                    description="Optimizes audio and reduces video for mobile network conditions"
                                    checked={settings.onTheGo}
                                    onChange={() => handleToggle('onTheGo')}
                                />
                                <SettingRow
                                    title="Translate what you say for others"
                                    description="Enable real-time speech-to-text captions automatically in meetings"
                                    checked={settings.translateSpeech}
                                    onChange={() => handleToggle('translateSpeech')}
                                    isLast
                                />
                            </motion.div>

                            {/* Privacy & Security Section */}
                            <motion.div
                                className="bg-surface/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10"
                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-xl font-bold mb-2 text-red-400">Privacy & Security</h2>
                                <p className="text-sm text-gray-500 mb-4">Control your data and privacy</p>

                                <div className="flex justify-between items-center py-5 border-b border-white/[0.06]">
                                    <div>
                                        <h3 className="font-semibold text-white text-[15px]">Blocked Users</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                            {blockedUsers.length > 0
                                                ? `${blockedUsers.length} user${blockedUsers.length > 1 ? 's' : ''} blocked`
                                                : 'No blocked users'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setBlockedModalOpen(true)}
                                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all border border-white/10 hover:border-white/20 active:scale-95"
                                    >
                                        Manage
                                    </button>
                                </div>
                                <div className="flex justify-between items-center py-5">
                                    <div>
                                        <h3 className="font-semibold text-white text-[15px]">Diagnostic info</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">View system info and help improve Streamify</p>
                                    </div>
                                    <button
                                        onClick={() => setDiagnosticModalOpen(true)}
                                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all border border-white/10 hover:border-white/20 active:scale-95"
                                    >
                                        View Report
                                    </button>
                                </div>
                            </motion.div>

                            {/* Danger Zone */}
                            <motion.div
                                className="bg-red-500/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-red-500/10"
                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-xl font-bold mb-4 text-red-400">Danger Zone</h2>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-white text-[15px]">Clear all settings</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">Reset all preferences to default values</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure? This will reset all your settings to defaults.')) {
                                                const keys = ['globalDarkMode','globalEmailNotifs','globalLimitData','globalLeaveEmpty','globalOnTheGo','globalTranslateSpeech','lowDataMode','blockedUsers'];
                                                keys.forEach(k => localStorage.removeItem(k));
                                                setSettings({
                                                    darkMode: true, emailNotifications: false, limitData: false,
                                                    leaveEmpty: true, onTheGo: true, translateSpeech: false
                                                });
                                                setBlockedUsers([]);
                                                showToast('All settings have been reset to defaults', 'success');
                                            }
                                        }}
                                        className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all border border-red-500/20 hover:border-red-500/30 active:scale-95"
                                    >
                                        Reset All
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-6 left-1/2 z-[100] px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-sm"
                        style={{
                            background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                            : <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                        }
                        <span className="text-sm font-medium text-white">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Blocked Users Modal */}
            <AnimatePresence>
                {blockedModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setBlockedModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#12141f] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold">Blocked Users</h3>
                                </div>
                                <button onClick={() => setBlockedModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {blockedUsers.length === 0 ? (
                                <div className="text-center py-10">
                                    <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">No blocked users</p>
                                    <p className="text-gray-500 text-sm mt-1">Users you block in meetings will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {blockedUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-bold text-indigo-300">
                                                    {user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-gray-500">Blocked {new Date(user.blockedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnblockUser(user.id)}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                                title="Unblock"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diagnostic Modal */}
            <AnimatePresence>
                {diagnosticModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDiagnosticModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#12141f] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                        <Bug className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold">Diagnostic Report</h3>
                                </div>
                                <button onClick={() => setDiagnosticModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-1 mb-6">
                                {Object.entries(getDiagnosticInfo()).map(([key, val]) => (
                                    <div key={key} className="flex justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                                        <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-sm text-white font-mono truncate ml-4 max-w-[200px]">{String(val)}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    const info = getDiagnosticInfo();
                                    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
                                    showToast('Diagnostic info copied to clipboard');
                                    setDiagnosticModalOpen(false);
                                }}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors active:scale-[0.98]"
                            >
                                Copy to Clipboard
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default withAuth(SettingsPage, 'settings');
