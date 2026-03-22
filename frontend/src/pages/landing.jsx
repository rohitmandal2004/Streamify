import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { Footer } from '../components/ui/footer';
import { useTheme } from '../contexts/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();

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

  const testimonials = [
    { name: 'Sarah Chen', role: 'Product Manager at TechCo', text: 'Streamify has transformed how our remote team collaborates. The video quality is unmatched and the interface is incredibly intuitive.', avatar: 'SC' },
    { name: 'James Wilson', role: 'Freelance Designer', text: 'I switched from Zoom to Streamify and never looked back. The clean design and smooth performance make every meeting a pleasure.', avatar: 'JW' },
    { name: 'Priya Patel', role: 'CEO at StartupHub', text: 'The security features and HD quality give us confidence for client presentations. Streamify is our go-to meeting platform.', avatar: 'PP' },
  ];

  const pricing = [
    {
      name: 'Free', price: '$0', period: '/month', desc: 'Perfect for personal use',
      features: ['HD video calls', 'Up to 40 min meetings', '100 participants', 'Screen sharing', 'Chat messaging'],
      cta: 'Get Started', popular: false
    },
    {
      name: 'Pro', price: '$12', period: '/month', desc: 'For professionals & small teams',
      features: ['Everything in Free', 'Unlimited meeting duration', '300 participants', 'Cloud recordings', 'Custom backgrounds', 'Priority support'],
      cta: 'Start Free Trial', popular: true
    },
    {
      name: 'Business', price: '$20', period: '/month', desc: 'For growing organizations',
      features: ['Everything in Pro', '500 participants', 'Admin dashboard', 'SSO integration', 'Dedicated support', 'Analytics & insights'],
      cta: 'Contact Sales', popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-primary-600/20 selection:text-primary-600 dark:selection:bg-primary-400/20 dark:selection:text-primary-400">

      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-primary-400/5 rounded-full blur-[100px]" />
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
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 dark:bg-primary-500/15 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              Now with HD Recording & Captions
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-[1.1] mb-6"
            >
              Seamless Meetings,{' '}
              <span className="text-gradient">Smarter Connections</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed"
            >
              Experience crystal-clear video calls with ultra-low latency. The modern conferencing platform built for teams that value quality and simplicity.
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-accent-500/20 blur-[80px] rounded-full scale-75" />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-lg mx-auto"
            >
              {/* Mock video call UI */}
              <div className="rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl bg-[var(--card-bg)] backdrop-blur-xl">
                {/* Top bar */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-tertiary)] ml-2">Streamify Meeting</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                    <Users size={14} />
                    <span className="text-xs font-medium">4</span>
                  </div>
                </div>
                {/* Grid of video cards */}
                <div className="p-3 grid grid-cols-2 gap-2">
                  {[
                    { name: 'Sarah C.', color: 'from-blue-500/40 to-blue-600/40', initials: 'SC' },
                    { name: 'James W.', color: 'from-purple-500/40 to-purple-600/40', initials: 'JW' },
                    { name: 'Priya P.', color: 'from-emerald-500/40 to-emerald-600/40', initials: 'PP' },
                    { name: 'You', color: 'from-primary-500/40 to-accent-500/40', initials: 'YO' },
                  ].map((p, i) => (
                    <div key={i} className={`aspect-video rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center relative overflow-hidden group`}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                        {p.initials}
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium">
                        {p.name}
                      </div>
                      {i === 3 && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary-500 text-white text-[9px] font-bold">YOU</div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Control bar */}
                <div className="px-4 py-3 flex items-center justify-center gap-3 border-t border-[var(--glass-border)]">
                  {['🎤', '📹', '💻', '💬'].map((icon, i) => (
                    <div key={i} className="w-9 h-9 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-sm hover:bg-[var(--glass-bg-hover)] cursor-pointer transition-colors">
                      {icon}
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center text-sm cursor-pointer border border-red-500/20">
                    📞
                  </div>
                </div>
              </div>
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
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={idx}
                whileHover={{ y: -4 }}
                className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-sm shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
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

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-6 py-16 sm:py-24 relative z-10 bg-[var(--background-secondary)] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-accent-500/10 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 border border-accent-500/20 mb-4">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4">
              Simple, <span className="text-gradient">Transparent Pricing</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Start free, upgrade when you need. No hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={idx}
                whileHover={{ y: -6 }}
                className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border backdrop-blur-sm transition-all relative ${
                  plan.popular
                    ? 'bg-gradient-to-b from-primary-600/10 to-accent-600/10 dark:from-primary-500/15 dark:to-accent-500/15 border-primary-500/30 shadow-lg shadow-primary-600/10'
                    : 'bg-[var(--card-bg)] border-[var(--card-border)] shadow-card hover:shadow-card-hover'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold btn-gradient text-white shadow-lg shadow-primary-600/20">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold font-display">{plan.price}</span>
                  <span className="text-[var(--text-tertiary)] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/auth')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'btn-gradient text-white shadow-lg shadow-primary-600/20'
                      : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
                  }`}
                >
                  {plan.cta}
                </motion.button>
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
