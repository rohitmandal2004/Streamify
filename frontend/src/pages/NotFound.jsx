import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0B0D17] text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-[100px]" />
            </div>

            {/* Logo */}
            <motion.div
                className="absolute top-6 left-6 z-20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Logo size="sm" clickable={true} />
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="relative z-10 text-center max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Glowing 404 */}
                <motion.div
                    className="relative mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    <h1 className="text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter select-none bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 backdrop-blur-xl shadow-[0_0_60px_rgba(99,102,241,0.15)]">
                            <Search className="w-10 h-10 text-indigo-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.h2
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Page Not Found
                </motion.h2>

                <motion.p
                    className="text-gray-400 mb-10 leading-relaxed max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-[0.97]"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 active:scale-[0.97]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </motion.div>
            </motion.div>

            {/* Decorative grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            />
        </div>
    );
}
