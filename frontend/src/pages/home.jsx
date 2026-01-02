import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import UserDropdown from '../components/UserDropdown';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import AddIcon from '@mui/icons-material/Add';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const { userData, addToUserHistory } = useContext(AuthContext); // Assuming userData might be available

  const generateMeetingCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      return;
    }
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const handleCreateMeeting = () => {
    const newCode = generateMeetingCode();
    navigate(`/${newCode}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinVideoCall();
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navbar */}
      <motion.nav
        className="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo192.png" alt="Streamify" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <UserDropdown userInitial={userData?.name ? userData.name[0] : "U"} />
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-7xl mx-auto">
        <motion.div
          className="text-center max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-surface border border-white/10 text-sm font-medium text-gray-400 mb-6">
            ✨ Secure & High Quality Video Meetings
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Premium Video Meetings <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              for Everyone
            </span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Connect, collaborate, and celebrate from anywhere with crystal clear video and audio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Join Meeting Card */}
          <motion.div
            className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:shadow-primary/20 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <KeyboardIcon className="text-blue-400" style={{ fontSize: 32 }} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Join Meeting</h3>
            <p className="text-gray-400 mb-8 h-12">Enter a code to join an existing meeting instantly.</p>

            <div className="space-y-4">
              <Input
                label="Enter Code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                placeholder="e.g. X8J-2KL"
                icon={KeyboardIcon}
                onKeyPress={handleKeyPress}
                className="bg-black/20"
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleJoinVideoCall}
                disabled={!meetingCode.trim()}
                className="shadow-primary/25"
              >
                Join Now
              </Button>
            </div>
          </motion.div>

          {/* Create Meeting Card */}
          <motion.div
            className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-glow hover:shadow-purple-500/20 group relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Decorative Background for Card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <AddIcon className="text-purple-400" style={{ fontSize: 32 }} />
            </div>
            <h3 className="text-2xl font-bold mb-2">New Meeting</h3>
            <p className="text-gray-400 mb-8 h-12">Start a new meeting and invite others to join.</p>

            <div className="space-y-4 mt-auto">
              <div className="h-[74px] flex items-end">
                {/* Spacer to align buttons visually or add more info */}
                <p className="text-sm text-gray-500">Get a link that you can share with anyone.</p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleCreateMeeting}
                className="hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/50"
              >
                Create Meeting
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
