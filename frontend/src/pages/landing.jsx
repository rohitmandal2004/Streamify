import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from '../components/Logo';
import { Footer } from '../components/ui/footer';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../utils/supabaseClient';
import { Skeleton } from '../components/ui/skeleton';
import {
  Video, MessageSquare, Shield, Monitor, Users, Zap,
  Play, ArrowRight, Check, Star, Sun, Moon, ChevronRight
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const { scrollY, scrollYProgress } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const blob1Y = useTransform(scrollY, [0, 1000], [0, 400]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, -300]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Video, title: 'HD Video Calls', desc: 'Crystal-clear 1080p video with adaptive bitrate for smooth streaming on any connection.' },
    { icon: MessageSquare, title: 'Real-time Chat', desc: 'Send messages, share files, and collaborate with built-in chat during meetings.' },
    { icon: Monitor, title: 'Screen Sharing', desc: 'Share your screen, a specific window, or a tab with one click during meetings.' },
    { icon: Shield, title: 'End-to-End Secure', desc: 'Enterprise-grade encryption keeps your meetings private and protected.' },
  ];

  const steps = [
    { num: '01', title: 'Create or Join', desc: 'Start a new meeting instantly or join with a meeting code.', icon: Play },
    { num: '02', title: 'Connect & Collaborate', desc: 'Video call with HD quality, share screens, and chat in real-time.', icon: Users },
    { num: '03', title: 'Review & Record', desc: 'Access meeting history, recordings, and continue the conversation.', icon: Zap },
  ];

  const [testimonials, setTestimonials] = useState([
    { name: 'Sarah Chen', role: 'Product Manager at TechCo', text: 'Streamify has transformed how our remote team collaborates. The video quality is unmatched and the interface is incredibly intuitive.', avatar: 'SC', rating: 5 },
    { name: 'James Wilson', role: 'Freelance Designer', text: 'I switched from Zoom to Streamify and never looked back. The clean design and smooth performance make every meeting a pleasure.', avatar: 'JW', rating: 5 },
    { name: 'Priya Patel', role: 'CEO at StartupHub', text: 'The security features and HD quality give us confidence for client presentations. Streamify is our go-to meeting platform.', avatar: 'PP', rating: 5 },
  ]);

  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (data && data.length > 0) {
          const formatted = data.map(t => ({
            name: t.name,
            role: t.role,
            text: t.content,
            rating: t.rating || 5,
            avatar: t.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
          }));
          setTestimonials(formatted);
        }
      } catch (e) {
        console.error("Could not fetch latest testimonials", e);
      } finally {
        setTestimonialsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);



  return (
    <div className="min-h-screen bg-black text-[var(--text-primary)] overflow-hidden font-sans selection:bg-primary-600/20 selection:text-primary-600 dark:selection:bg-primary-400/20 dark:selection:text-primary-400">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      </div>

      {/* Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] shadow-sm'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" clickable={true} />
          <div className="flex items-center gap-3">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="hidden sm:inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold btn-gradient text-white shadow-lg shadow-primary-600/20"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              Security Infrastructure Online
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-sans leading-[1.1] mb-6 drop-shadow-md"
            >
              Enterprise-Grade <br />
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Video Infrastructure.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-base sm:text-lg text-slate-400 mb-8 max-w-lg leading-relaxed font-mono"
            >
              Build secure, reliable, and high-performance communication systems. Specifically designed to empower the modern, encrypted workspace.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth')}
                className="px-8 py-4 rounded-2xl font-semibold text-base btn-gradient text-white shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 touch-manipulation"
              >
                <Video size={20} /> Start Meeting
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth')}
                className="px-8 py-4 rounded-2xl font-semibold text-base bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] flex items-center justify-center gap-2 touch-manipulation backdrop-blur-sm"
              >
                Join Meeting <ArrowRight size={18} />
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-6 text-sm text-[var(--text-secondary)]">
              {[
                { label: 'Unlimited', sub: 'Duration' },
                { label: 'HD Quality', sub: 'Video & Audio' },
                { label: '100+', sub: 'Participants' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-bold text-[var(--text-primary)] text-lg">{stat.label}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">{stat.sub}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative flex items-center justify-center pt-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl flex items-center justify-center p-4 filter drop-shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
            >
              <img src="/images/isometric_hero_meeting.png" alt="Streamify Infrastructure Illustration" className="w-full h-auto rounded-xl object-contain shadow-[0_0_80px_rgba(255,255,255,0.03)] hover:scale-[1.02] transition-transform duration-700 ease-out" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Why Choose <span className="text-gradient">Streamify?</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Engineered for reliability, designed for simplicity. Everything you need for seamless video meetings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={idx}
                  whileHover={{ y: -6 }}
                  className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-primary-500/30 dark:hover:border-primary-400/30 transition-all cursor-default group backdrop-blur-sm shadow-card hover:shadow-card-hover"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 dark:from-primary-500/20 dark:to-accent-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-primary-500/10">
                    <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 relative z-10 bg-[var(--background-secondary)] dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-accent-500/10 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 border border-accent-500/20 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Get Started in <span className="text-gradient">3 Steps</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              From sign-up to your first meeting in under a minute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary-500/30 via-accent-500/30 to-primary-500/30" />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={idx}
                  className="text-center relative"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-600/20 relative z-10">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2 block">{step.num}</span>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Loved by <span className="text-gradient">Teams Worldwide</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-sm shadow-card">
                  <div className="flex items-center gap-1 mb-4">
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-4" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="w-24 h-4 mb-1" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                  </div>
                </div>
              ))
            ) : testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={idx}
                whileHover={{ y: -4 }}
                className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-sm shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-6">
              Ready to Transform Your <span className="text-gradient">Meetings?</span>
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
              Join thousands of teams already using Streamify for seamless video conferencing.
            </p>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth')}
              className="px-10 py-4 rounded-2xl font-semibold text-base btn-gradient text-white shadow-lg shadow-primary-600/25 inline-flex items-center gap-2 touch-manipulation"
            >
              Get Started Free <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
