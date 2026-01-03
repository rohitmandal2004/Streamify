import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';

const UserDropdown = ({ userInitial = 'U' }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="cursor-pointer rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all p-0.5"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40, fontSize: '1.1rem', fontWeight: 600 }}>
          {userInitial}
        </Avatar>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-[calc(100%+0.5rem)] right-0 min-w-[200px] p-2 rounded-2xl bg-surface/90 backdrop-blur-xl border border-white/10 shadow-xl z-50 origin-top-right overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </div>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-200 hover:bg-white/10 transition-colors"
              onClick={() => {
                navigate('/history');
                setOpen(false);
              }}
            >
              <HistoryIcon fontSize="small" className="text-gray-400" />
              <span className="text-sm font-medium">History</span>
            </div>

            <div className="h-px bg-white/10 my-1 mx-2"></div>

            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-400 hover:bg-red-500/10 transition-colors group"
              onClick={handleLogout}
            >
              <LogoutIcon fontSize="small" className="text-red-400 group-hover:text-red-300" />
              <span className="text-sm font-medium">Logout</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;


