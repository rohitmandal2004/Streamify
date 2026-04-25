import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays, Share2, X, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';
import withAuth from '../utils/withAuth';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

function CalendarPage() {
    const context = useContext(AuthContext) as any;
    const handleLogout = context?.handleLogout;
    const userData = context?.userData;

    const [open, setOpen] = useState(true);

    const links = [
        { label: "Dashboard", href: "/home", icon: <LayoutDashboard className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "History", href: "/history", icon: <UserCog className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "Calendar", href: "/calendar", icon: <CalendarDays className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "Settings", href: "/settings", icon: <Settings className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
        { label: "Logout", href: "#", onClick: handleLogout, icon: <LogOut className="text-gray-300 h-5 w-5 flex-shrink-0" /> },
    ];

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>("10:00");
    const [meetingName, setMeetingName] = useState("");
    const [bookedMeetings, setBookedMeetings] = useState<any[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loadingMeetings, setLoadingMeetings] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (context?.getScheduledMeetings) {
            setLoadingMeetings(true);
            context.getScheduledMeetings().then((meetings: any) => {
                if (meetings) {
                    const formattedMeetings = meetings.map((m: any) => {
                        const d = new Date(m.scheduled_time);
                        return {
                            id: m.meeting_code,
                            name: m.meeting_name,
                            date: d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
                            time: d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }),
                            link: `/${m.meeting_code}`,
                            rawDate: m.scheduled_time
                        };
                    });
                    setBookedMeetings(formattedMeetings);
                }
            }).finally(() => setLoadingMeetings(false));
        } else {
            setLoadingMeetings(false);
        }
    }, [context]);

    const handleBookMeeting = async () => {
        if (date && selectedTime) {
            setIsBooking(true);
            const meetingId = Math.random().toString(36).substring(2, 9);
            
            const [hours, minutes] = selectedTime.split(':');
            const scheduledDate = new Date(date);
            scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const meetingDetails = {
                meetingCode: meetingId,
                meetingName: meetingName || "Scheduled Meeting",
                scheduledTime: scheduledDate.toISOString()
            };

            try {
                if (context?.scheduleMeeting) {
                    await context.scheduleMeeting(meetingDetails);
                }

                // Import the server URL defined in environment.js
                // Add this import at the top of the file: import server from '../environment';
                // However, doing this inline since it's just a variable. Let's fix the imports too.
                // Wait, it's safer to just dynamically check window.location like environment.js does
                const IS_PROD = window.location.hostname !== 'localhost';
                const backendUrl = IS_PROD ? "https://streamifybackend-o6vn.onrender.com" : "http://localhost:8000";
                
                await fetch(`${backendUrl}/api/email/send-confirmation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: userData?.email,
                        meetingName: meetingDetails.meetingName,
                        scheduledTime: meetingDetails.scheduledTime,
                        meetingLink: `/${meetingId}`
                    })
                });

                const newMeeting = {
                    id: meetingId,
                    name: meetingDetails.meetingName,
                    date: date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
                    time: selectedTime,
                    link: `/${meetingId}`,
                    rawDate: scheduledDate.toISOString()
                };
                setBookedMeetings([...bookedMeetings, newMeeting]);
                setMeetingName("");
                setDate(undefined);
                setSelectedTime(null);
            } catch (err) {
                console.error("Failed to book meeting", err);
            } finally {
                setIsBooking(false);
            }
        }
    };

    const handleCancelMeeting = async (meetingCode: string) => {
        if (!window.confirm("Are you sure you want to cancel this meeting? This action cannot be undone.")) return;
        setCancellingId(meetingCode);
        try {
            if (context?.cancelScheduledMeeting) {
                await context.cancelScheduledMeeting(meetingCode);
            }
            setBookedMeetings(prev => prev.filter(m => m.id !== meetingCode));
        } catch (err) {
            console.error("Failed to cancel meeting", err);
        } finally {
            setCancellingId(null);
        }
    };

    const handleShareMeeting = async (meeting: any) => {
        const IS_PROD = window.location.hostname !== 'localhost';
        const baseUrl = IS_PROD ? window.location.origin : 'http://localhost:3000';
        const fullLink = `${baseUrl}${meeting.link}`;
        const shareText = `You're invited to join "${meeting.name}" on ${meeting.date} at ${meeting.time}.\n\nJoin here: ${fullLink}`;

        // Try native share first (mobile-friendly)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Streamify: ${meeting.name}`,
                    text: shareText,
                    url: fullLink
                });
                return;
            } catch (err) {
                // User cancelled or share failed, fall through to clipboard
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            setCopiedId(meeting.id);
            setTimeout(() => setCopiedId(null), 2500);
        } catch (err) {
            // Final fallback
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiedId(meeting.id);
            setTimeout(() => setCopiedId(null), 2500);
        }
    };

    const timeSlots = Array.from({ length: 37 }, (_, i) => {
        const totalMinutes = i * 15;
        const hour = Math.floor(totalMinutes / 60) + 9;
        const minute = totalMinutes % 60;
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    });

    const bookedDates = Array.from(
        { length: 3 },
        (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + 2 + i);
            return d;
        }
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
            <div className="flex flex-1 overflow-y-auto w-full p-8 pb-32 md:pb-8 flex-col bg-transparent relative z-10">
                <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-4xl font-bold mb-8">Calendar & Scheduling</h1>

                    {/* Ported Calendar20 component directly into the content layout with Premium Styling */}
                    <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl mb-8 group">
                        {/* Background Image with slow zoom */}
                        <div 
                            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-110 opacity-40"
                            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop)` }}
                        />
                        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B0D17]/95 via-[#0B0D17]/80 to-indigo-900/40 backdrop-blur-[20px]" />
                        
                        <div className="relative z-10">
                            <Card className="gap-0 p-0 border-0 bg-transparent text-white shadow-none rounded-none">
                                <CardContent className="relative p-0 md:pr-64">
                                    <div className="p-8 md:p-10">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-white drop-shadow-md">Select Date</h2>
                                            <p className="text-gray-300 text-sm mt-1">Pick a day for your upcoming meeting.</p>
                                        </div>
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate as any}
                                            defaultMonth={date}
                                            disabled={bookedDates}
                                            showOutsideDays={false}
                                            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)] text-white"
                                        />
                                    </div>
                                    <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-3 overflow-y-auto border-t border-white/10 p-6 md:p-8 md:absolute md:max-h-none md:w-64 md:border-t-0 md:border-l bg-black/20 backdrop-blur-md">
                                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Available Times</h3>
                                        <div className="grid gap-2">
                                            {timeSlots.map((time) => (
                                                <Button
                                                    key={time}
                                                    variant={selectedTime === time ? "primary" : "outline"}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={cn(
                                                        "w-full shadow-none transition-all duration-300 rounded-xl py-6 font-medium",
                                                        selectedTime === time ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border-indigo-500" : "border-white/10 hover:border-white/30 hover:bg-white/10 bg-black/30 backdrop-blur-sm text-gray-300 hover:text-white"
                                                    )}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-6 border-t border-white/10 px-8 py-6 md:flex-row bg-black/40 backdrop-blur-xl">
                            <div className="text-sm text-gray-300">
                                {date && selectedTime ? (
                                    <>
                                        Your meeting is booked for{" "}
                                        <span className="font-medium text-white">
                                            {" "}
                                            {date?.toLocaleDateString("en-US", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                            })}{" "}
                                        </span>
                                        at <span className="font-medium text-white">{selectedTime}</span>.
                                    </>
                                ) : (
                                    <>Select a date and time for your meeting.</>
                                )}
                            </div>
                                <div className="flex flex-col gap-3 w-full md:w-auto md:ml-auto">
                                    <input
                                        type="text"
                                        placeholder="Meeting Name (optional)"
                                        value={meetingName}
                                        onChange={(e) => setMeetingName(e.target.value)}
                                        className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full md:w-64 transition-all"
                                    />
                                    <Button
                                        disabled={!date || !selectedTime}
                                        onClick={handleBookMeeting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 py-6 rounded-xl font-semibold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:shadow-none"
                                        variant="outline"
                                    >
                                        Book Meeting
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                    </div>
                    {/* Booked Meetings Section - Modern Premium Cards */}
                    {loadingMeetings ? (
                        <div className="mt-16 mb-20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.02] min-h-[280px] flex flex-col justify-end">
                                        <div className="relative z-10 p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="w-8 h-8 rounded-xl" />
                                                    <Skeleton className="w-8 h-8 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="pt-8 space-y-3">
                                                <Skeleton className="h-7 w-48" />
                                                <Skeleton className="h-4 w-36" />
                                            </div>
                                            <div className="flex gap-2">
                                                <Skeleton className="h-12 flex-1 rounded-xl" />
                                                <Skeleton className="h-12 w-14 rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : bookedMeetings.length > 0 && (
                        <div className="mt-16 mb-20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookedMeetings
                                    .filter((meeting) => {
                                        // Show only upcoming meetings based on the raw date
                                        if (!meeting.rawDate) return true; // fallback
                                        const meetingDate = new Date(meeting.rawDate);
                                        return meetingDate > new Date();
                                    })
                                    .map((meeting, index) => {
                                        const bgImages = [
                                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
                                            "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=2560&auto=format&fit=crop",
                                            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop",
                                            "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2560&auto=format&fit=crop"
                                        ];
                                        const bgImage = bgImages[index % bgImages.length];

                                        return (
                                            <div 
                                                key={index} 
                                                className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-black/50 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/30 min-h-[280px] flex flex-col justify-end"
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
                                                    {/* Top row: Badge + Actions */}
                                                    <div className="flex justify-between items-start mb-12">
                                                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                                                            <span className="text-xs font-semibold tracking-wider text-white uppercase flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                                Upcoming
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleShareMeeting(meeting); }}
                                                                className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-indigo-500/30 hover:border-indigo-400/40 transition-all duration-300 group/share"
                                                                title="Share meeting invite"
                                                            >
                                                                {copiedId === meeting.id ? (
                                                                    <Check className="h-4 w-4 text-green-400" />
                                                                ) : (
                                                                    <Share2 className="h-4 w-4 text-white/80 group-hover/share:text-indigo-300" />
                                                                )}
                                                            </button>
                                                            {/* Cancel Button */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleCancelMeeting(meeting.id); }}
                                                                disabled={cancellingId === meeting.id}
                                                                className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500/30 hover:border-red-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/cancel"
                                                                title="Cancel meeting"
                                                            >
                                                                <X className={`h-4 w-4 text-white/80 group-hover/cancel:text-red-300 ${cancellingId === meeting.id ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Bottom content */}
                                                    <div className="space-y-5">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-200 transition-colors drop-shadow-md">
                                                                {meeting.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-200 font-medium flex items-center gap-1.5 drop-shadow">
                                                                <CalendarDays className="h-4 w-4 opacity-80" />
                                                                {meeting.date} • {meeting.time}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Action Buttons Row */}
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => navigate(meeting.link)}
                                                                className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 py-6 rounded-xl font-semibold text-base transition-all duration-300 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                                            >
                                                                Join Meeting
                                                            </Button>
                                                            <Button
                                                                onClick={(e: any) => { e.stopPropagation(); handleShareMeeting(meeting); }}
                                                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 py-6 px-4 rounded-xl font-semibold transition-all duration-300 hover:border-indigo-400/40 hover:shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                                                                title="Copy invite link"
                                                            >
                                                                {copiedId === meeting.id ? (
                                                                    <Check className="h-5 w-5 text-green-400" />
                                                                ) : (
                                                                    <Copy className="h-5 w-5" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Copied toast */}
                                                {copiedId === meeting.id && (
                                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-green-500/90 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow-lg animate-bounce">
                                                        ✓ Invite copied to clipboard!
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default withAuth(CalendarPage, 'calendar');
