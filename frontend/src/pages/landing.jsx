import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import LockIcon from '@mui/icons-material/Lock';
import SpeedIcon from '@mui/icons-material/Speed';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import FloatingCubes from '../components/3d/FloatingCubes';
import heroMockup from '../assets/hero-mockup.png'; // Import Hero Image

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white overflow-hidden font-sans">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* 3D Floating Cubes Background */}
      <FloatingCubes />

      {/* Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" clickable={true} />

          <div className="flex items-center gap-6">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium border border-white/10 transition-all"
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Mobile Optimized */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
              </span>
              New: HD Video Recording
            </motion.div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-4 sm:mb-6 relative px-2">
              <span className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50 animate-pulse"></span>
              <span className="relative">Connect with <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Anyone, Anywhere
                </span></span>
            </h1>

            <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-lg leading-relaxed px-2">
              Experience ultra-low latency video calls with crystal clear audio.
              The professional choice for remote teams and personal connections.
            </p>

            {/* Trust Indicators - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8 px-2"
            >
              {[
                { icon: LockIcon, text: 'Encrypted', color: 'text-green-400' },
                { icon: SpeedIcon, text: 'Low Latency', color: 'text-blue-400' },
                { icon: HighQualityIcon, text: 'HD Quality', color: 'text-purple-400' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`text-xs sm:text-sm ${item.color}`} />
                    <span className="text-xs sm:text-sm text-gray-300 font-medium">{item.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-2">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-lg shadow-indigo-500/30 transition-all relative overflow-hidden group touch-manipulation"
              >
                <span className="relative z-10">Start Meeting</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              </motion.button>

              <div className="flex items-center gap-6 px-4 ml-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-base">Unlimited</span>
                  <span className="text-xs text-gray-400">Duration</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-base">HD Quality</span>
                  <span className="text-xs text-gray-400">Video & Audio</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[500px] w-full flex items-center justify-center z-20 perspective-1000"
          >
            {/* Glowing Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-[100px] rounded-full transform scale-75 pointer-events-none" />

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-lg lg:max-w-xl mx-auto rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/50 border border-white/10 group bg-black/50"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
              <img
                src={heroMockup}
                alt="Streamify Interface"
                className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </motion.div>


        </div >
      </div >

      {/* Features Grid - Mobile Optimized */}
      < div className="px-4 sm:px-6 py-12 sm:py-20 bg-surface/30 relative" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Why Choose Streamify?</h2>
            <p className="text-sm sm:text-base text-gray-400">Engineered for reliability and designed for simplicity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              { title: "HD Quality", desc: "1080p video and 48kHz audio clarity.", icon: "📹" },
              { title: "Secure", desc: "End-to-end encryption for all your calls.", icon: "🔒" },
              { title: "Unlimited", desc: "No time limits on your meetings.", icon: "∞" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-default group backdrop-blur-sm"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div >

      {/* Footer */}
      < Footer />
    </div >
  );
}
