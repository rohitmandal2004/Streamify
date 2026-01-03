import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  clickable = true 
}) => {
  const navigate = useNavigate();
  
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' }
  };

  const sizeConfig = sizes[size] || sizes.md;

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-2 ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      whileHover={clickable ? { scale: 1.05 } : {}}
      whileTap={clickable ? { scale: 0.95 } : {}}
    >
      <div className={`${sizeConfig.icon} rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <span className="relative font-bold text-white z-10" style={{ fontSize: size === 'sm' ? '0.875rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.5rem' : '2rem' }}>
          S
        </span>
      </div>
      {showText && (
        <span className={`${sizeConfig.text} font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200`}>
          Streamify
        </span>
      )}
    </motion.div>
  );
};

export default Logo;

