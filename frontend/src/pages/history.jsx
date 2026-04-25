import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '../components/Button';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';
import { Skeleton } from '../components/ui/skeleton';
import withAuth from '../utils/withAuth';

function History() {
  const { getHistoryOfUser, handleLogout, userData } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const routeTo = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Dashboard", href: "/home", icon: <LayoutDashboard className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
    { label: "History", href: "/history", icon: <UserCog className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
    { label: "Calendar", href: "/calendar", icon: <CalendarDays className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
    { label: "Logout", href: "#", onClick: handleLogout, icon: <LogOut className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = await getHistoryOfUser();
        setMeetings(history || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className={cn("flex flex-col md:flex-row bg-[#000000] w-full flex-1 overflow-hidden h-screen text-white")}>
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

      <div className="flex flex-1 overflow-y-auto w-full relative h-screen">
        <div className="min-h-full bg-transparent relative flex flex-col w-full p-6 sm:p-10 pb-32 md:pb-10">
          {/* Background Ambience */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none w-full h-full">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto w-full z-10 relative">
            <motion.div
              className="text-center md:text-left mb-12 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <HistoryIcon className="text-white" style={{ fontSize: 32 }} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">Your Meeting History</h1>
                  <p className="text-gray-400">View and rejoin your previous meetings</p>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3 w-full">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="w-full">
                          <Skeleton className="h-3 w-20 mb-2" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
                  <VideoCallIcon className="text-gray-600" style={{ fontSize: 48 }} />
                </div>
                <h3 className="text-xl font-bold mb-2">No meetings yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm">Your meeting history will appear here once you join or create a meeting.</p>
                <Button variant="primary" onClick={() => routeTo("/home")}>
                  Start a Meeting
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.map((meeting, index) => {
                    const bgImages = [
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=2560&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2560&auto=format&fit=crop"
                    ];
                    const bgImage = bgImages[index % bgImages.length];

                    return (
                        <motion.div 
                            key={index} 
                            className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-black/50 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/30 min-h-[280px] flex flex-col justify-end"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Background Image with slight blur */}
                            <div 
                                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-70 blur-[2px] group-hover:blur-0"
                                style={{ backgroundImage: `url(${bgImage})` }}
                            />
                            
                            {/* Dimmed Gradient Overlay for readability */}
                            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/80 to-transparent" />
                            
                            {/* Content */}
                            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                {/* Top row: Badge */}
                                <div className="flex justify-between items-start mb-12">
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                                        <span className="text-xs font-semibold tracking-wider text-white uppercase flex items-center gap-1.5">
                                            <VideoCallIcon fontSize="small" className="opacity-80" />
                                            Past Meeting
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Bottom content */}
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-200 transition-colors drop-shadow-md">
                                            Code: {meeting.meetingCode}
                                        </h3>
                                        <div className="flex flex-col gap-1 text-sm text-gray-200 font-medium drop-shadow">
                                            <p className="flex items-center gap-1.5">
                                                <CalendarTodayIcon fontSize="small" className="opacity-80" />
                                                {formatDate(meeting.date)} • {formatTime(meeting.date)}
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <AccessTimeIcon fontSize="small" className="opacity-80" />
                                                {meeting.duration ? `${meeting.duration} Mins` : `Duration Unknown`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        onClick={() => routeTo(`/${meeting.meetingCode}`)}
                                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 py-6 rounded-xl font-semibold text-base transition-all duration-300 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                    >
                                        Rejoin Meeting
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(History);
