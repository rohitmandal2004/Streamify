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
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import FloatingCubes from '../components/3d/FloatingCubes';

function HomeComponent() {
  const navigate = useNavigate();
  // ... (omitting context, tool handles it)

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
      {/* Floating 3D Background */}
      <FloatingCubes count={20} />

      {/* Navbar - Mobile Optimized */}
      <motion.nav
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 safe-area-top"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo size="sm" clickable={true} className="sm:hidden" />
        <Logo size="md" clickable={true} className="hidden sm:block" />
        <div className="flex items-center gap-2 sm:gap-4">
          <UserDropdown userInitial={userData?.name ? userData.name[0] : "U"} />
        </div>
      </motion.nav>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10 w-full max-w-7xl mx-auto pointer-events-none">
        <motion.div
          className="text-center max-w-2xl mb-8 sm:mb-16 pointer-events-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm font-medium text-indigo-400 mb-4 sm:mb-6 backdrop-blur-sm">
            ✨ Secure & High Quality Video Meetings
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight relative px-2">
            <span className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50 animate-pulse"></span>
            <span className="relative">Premium Video Meetings <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                for Everyone
              </span></span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-400 leading-relaxed px-2">
            Connect, collaborate, and celebrate from anywhere with crystal clear video and audio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-4xl pointer-events-auto">
          {/* Join Meeting Card */}
          <motion.div
            className="bg-surface/50 backdrop-blur-xl p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-glow hover:shadow-indigo-500/20 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform border border-indigo-500/20">
              <KeyboardIcon className="text-indigo-400" style={{ fontSize: window.innerWidth < 640 ? 24 : 32 }} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Join Meeting</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 min-h-[3rem] sm:h-12">Enter a code to join an existing meeting instantly.</p>

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
                className="shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
              >
                Join Now
              </Button>
            </div>
          </motion.div>

          {/* Create Meeting Card */}
          <motion.div
            className="bg-surface/50 backdrop-blur-xl p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-glow hover:shadow-purple-500/20 group relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            {/* Decorative Background for Card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100" />

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform border border-purple-500/20">
              <AddIcon className="text-purple-400" style={{ fontSize: window.innerWidth < 640 ? 24 : 32 }} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">New Meeting</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 min-h-[3rem] sm:h-12">Start a new meeting and invite others to join.</p>

            <div className="space-y-4 mt-auto">
              <div className="min-h-[3rem] sm:h-[74px] flex items-end">
                <p className="text-xs sm:text-sm text-gray-500">Get a link that you can share with anyone.</p>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default withAuth(HomeComponent);



