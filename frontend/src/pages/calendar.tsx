import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';
import withAuth from '../utils/withAuth';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardFooter } from '../components/ui/card';

function CalendarPage() {
    const context = useContext(AuthContext) as any;
    const handleLogout = context?.handleLogout;
    const userData = context?.userData;

    const [open, setOpen] = useState(false);

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
    const navigate = useNavigate();

    const handleBookMeeting = () => {
        if (date && selectedTime) {
            const meetingId = Math.random().toString(36).substring(2, 9);
            const newMeeting = {
                id: meetingId,
                name: meetingName || "Scheduled Meeting",
                date: date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
                time: selectedTime,
                link: `/${meetingId}` // The main video meeting route catches /:url
            };
            setBookedMeetings([...bookedMeetings, newMeeting]);
            setMeetingName("");
            setDate(undefined);
            setSelectedTime(null);
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
                <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-4xl font-bold mb-8">Calendar & Scheduling</h1>

                    {/* Ported Calendar20 component directly into the content layout */}
                    <Card className="gap-0 p-0 border-white/10 bg-surface/50 backdrop-blur-xl text-white">
                        <CardContent className="relative p-0 md:pr-48">
                            <div className="p-6">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate as any}
                                    defaultMonth={date}
                                    disabled={bookedDates}
                                    showOutsideDays={false}
                                    modifiers={{
                                        booked: bookedDates,
                                    }}
                                    modifiersClassNames={{
                                        booked: "[&>button]:line-through opacity-100",
                                    }}
                                    className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)] text-white"
                                    formatters={{
                                        formatWeekdayName: (date: Date) => {
                                            return date.toLocaleString("en-US", { weekday: "short" })
                                        },
                                    }}
                                />
                            </div>
                            <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t border-white/10 p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l">
                                <div className="grid gap-2">
                                    {timeSlots.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "primary" : "outline"}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(
                                                "w-full shadow-none",
                                                selectedTime === time ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "border-white/10 hover:bg-white/10 bg-transparent text-gray-300 hover:text-white"
                                            )}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 border-t border-white/10 px-6 !py-5 md:flex-row">
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
                            <div className="flex flex-col gap-2 w-full md:w-auto md:ml-auto">
                                <input
                                    type="text"
                                    placeholder="Meeting Name (optional)"
                                    value={meetingName}
                                    onChange={(e) => setMeetingName(e.target.value)}
                                    className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full md:w-48"
                                />
                                <Button
                                    disabled={!date || !selectedTime}
                                    onClick={handleBookMeeting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                                    variant="outline"
                                >
                                    Book Meeting
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Booked Meetings Section */}
                    {bookedMeetings.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-4">Your Booked Meetings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bookedMeetings.map((meeting, index) => (
                                    <div key={index} className="p-5 rounded-lg border border-white/10 bg-surface/50 backdrop-blur-xl flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-semibold text-white truncate pr-2">{meeting.name}</h3>
                                            <span className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-1 rounded">ID: {meeting.id}</span>
                                        </div>
                                        <div className="text-sm text-gray-300 flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4" />
                                            {meeting.date} at {meeting.time}
                                        </div>
                                        <div className="mt-4 flex gap-2 w-full">
                                            <Button
                                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}${meeting.link}`)}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0 text-sm py-1 h-auto"
                                                variant="outline"
                                            >
                                                Copy Link
                                            </Button>
                                            <Button
                                                onClick={() => navigate(meeting.link)}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-sm py-1 h-auto"
                                                variant="outline"
                                            >
                                                Join Meeting
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default withAuth(CalendarPage);
