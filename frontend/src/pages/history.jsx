import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '../components/Button';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const routeTo = useNavigate();

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
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        className="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => routeTo("/home")}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <HomeIcon />
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <h2 className="text-xl font-bold tracking-tight">Meeting History</h2>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 z-10 relative">
        <motion.div
          className="text-center mb-12 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <HistoryIcon className="text-white" style={{ fontSize: 32 }} />
          </div>
          <h1 className="text-4xl font-bold mb-3">Your Meeting History</h1>
          <p className="text-gray-400">View and rejoin your previous meetings</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading your meetings...</p>
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
            <Button
              variant="primary"
              onClick={() => routeTo("/home")}
            >
              Start a Meeting
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting, index) => (
              <motion.div
                key={index}
                className="group bg-surface/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:border-primary/30 hover:bg-surface/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <VideoCallIcon />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Meeting Code</p>
                      <p className="text-lg font-mono font-bold tracking-wide text-white">{meeting.meetingCode}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                    <span className="flex items-center gap-2 text-gray-400">
                      <CalendarTodayIcon fontSize="small" />
                      Date
                    </span>
                    <span className="font-medium text-gray-200">{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                    <span className="flex items-center gap-2 text-gray-400">
                      <AccessTimeIcon fontSize="small" />
                      Time
                    </span>
                    <span className="font-medium text-gray-200">{formatTime(meeting.date)}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => routeTo(`/${meeting.meetingCode}`)}
                  className="group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300"
                >
                  Rejoin Meeting
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
