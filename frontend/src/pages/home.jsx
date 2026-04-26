import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import UserDropdown from '../components/UserDropdown';

import KeyboardIcon from '@mui/icons-material/Keyboard';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Logo from '../components/Logo';
import { Footer } from '../components/ui/footer';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { supabase } from '../utils/supabaseClient';
import { LayoutDashboard, UserCog, Settings, LogOut, CalendarDays, Star } from 'lucide-react';
import { cn } from '../lib/utils';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const { userData, addToUserHistory, handleLogout } = useContext(AuthContext);
  const [open, setOpen] = useState(true);
  const [createdCode, setCreatedCode] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewRole, setReviewRole] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return;
    setIsSubmittingReview(true);
    try {
      const { error } = await supabase.from('testimonials').insert([
        {
          user_id: userData?.id || 'anonymous',
          name: userData?.fullName || userData?.firstName || 'Streamify User',
          role: reviewRole || 'Professional',
          content: reviewContent,
          rating: reviewRating
        }
      ]);
      if (error) throw error;
      setReviewSuccess(true);
      setReviewContent('');
      setReviewRole('');
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
    setCreatedCode(newCode);
    setInviteCopied(false);
  };

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/${createdCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    });
  };

  const handleGoToMeeting = () => {
    navigate(`/${createdCode}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinVideoCall();
    }
  };

  return (
    <div className={cn("flex flex-col md:flex-row bg-black w-full flex-1 overflow-hidden h-screen text-white")}>
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-black w-full h-full pointer-events-none">
      </div>

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
          <div className="absolute inset-0 z-0 bg-black pointer-events-none w-full h-full">
          </div>

          {/* Navbar - Mobile Optimized (Top bar since Sidebar handles Desktop) */}
          <motion.nav
            className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 md:hidden"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <Logo size="sm" clickable={true} />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <UserDropdown userInitial={userData?.name ? userData.name[0] : "U"} />
            </div>
          </motion.nav>

          {/* Main Content */}
          <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-12 p-4 sm:p-6 z-10 w-full max-w-7xl mx-auto pointer-events-none pt-10">
            <motion.div
              className="w-full xl:w-1/2 flex items-center justify-center pointer-events-auto"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src="/images/isometric_dashboard_analytics.png" alt="Analytics Dashboard" className="max-w-full h-auto drop-shadow-2xl" />
            </motion.div>

            <motion.div
              className="text-left w-full xl:w-1/2 pointer-events-auto"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs sm:text-sm font-medium text-slate-300 mb-4 sm:mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Secure Environment Active
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight font-sans tracking-tight drop-shadow">
                Manage Secure <br />
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Comms Infrastructure</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 font-mono mb-10 max-w-md leading-relaxed">
                Seamlessly provision high-bandwidth, end-to-end encrypted rooms. Execute workflows instantly.
              </p>
            </motion.div>
          </div>

          <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-8 pb-32 md:pb-20 z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full pointer-events-auto">
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100" />

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform border border-purple-500/20">
                  <AddIcon className="text-purple-400" style={{ fontSize: window.innerWidth < 640 ? 24 : 32 }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">New Meeting</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 min-h-[3rem] sm:h-12">Start a new meeting and invite others to join.</p>

                <div className="space-y-4 mt-auto">
                  {createdCode ? (
                    <>
                      <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-gray-500 mb-1.5">Meeting Link</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm text-purple-300 font-mono truncate">{window.location.origin}/{createdCode}</code>
                          <button
                            onClick={handleCopyInvite}
                            className={`p-2 rounded-lg transition-all text-sm flex-shrink-0 ${
                              inviteCopied
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                            }`}
                            title="Copy invite link"
                          >
                            {inviteCopied ? <CheckIcon style={{ fontSize: 16 }} /> : <ContentCopyIcon style={{ fontSize: 16 }} />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="lg"
                          fullWidth
                          onClick={() => { setCreatedCode(''); setInviteCopied(false); }}
                          className="hover:bg-white/10"
                        >
                          New Code
                        </Button>
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={handleGoToMeeting}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          Join
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Submit Review Card — Premium */}
            <motion.div
              className="w-full group relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl pointer-events-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30 transition-transform duration-[15s] group-hover:scale-110"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop')` }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B0D17]/95 via-[#0B0D17]/85 to-indigo-900/30 backdrop-blur-[2px]" />

              <div className="relative z-10 p-6 sm:p-10">
                {reviewSuccess ? (
                  <motion.div
                    className="flex flex-col items-center text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                      <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                    <p className="text-gray-300 max-w-sm">Your review has been submitted and is now live on the landing page.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                      <div>
                        <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                          Community
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white">Share Your Experience</h3>
                        <p className="text-gray-400 text-sm mt-1">Your feedback helps us improve Streamify for everyone</p>
                      </div>
                      {/* Star Rating */}
                      <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-7 h-7 cursor-pointer transition-all duration-200 hover:scale-125 ${
                              star <= reviewRating 
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' 
                                : 'text-gray-600 hover:text-gray-400'
                            }`}
                            onClick={() => setReviewRating(star)}
                          />
                        ))}
                        <span className="text-sm font-semibold text-yellow-400/80 ml-2 min-w-[2ch]">{reviewRating}.0</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Role <span className="text-gray-500">(optional)</span></label>
                        <input
                          type="text"
                          value={reviewRole}
                          onChange={(e) => setReviewRole(e.target.value)}
                          placeholder="e.g. Product Manager at TechCo"
                          className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={userData?.fullName || userData?.firstName || ''}
                          disabled
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 text-gray-400 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Your Review</label>
                      <textarea 
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Tell us how Streamify has helped your team collaborate better..."
                        rows={4}
                        className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm resize-none leading-relaxed"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">{reviewContent.length}/500 characters</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={handleSubmitReview} 
                        disabled={isSubmittingReview || !reviewContent.trim()}
                        className="w-full sm:w-auto shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 px-8"
                      >
                        {isSubmittingReview ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </span>
                        ) : 'Submit Testimonial'}
                      </Button>
                      <p className="text-xs text-gray-500">Your review will appear on the landing page</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent, 'dashboard');
