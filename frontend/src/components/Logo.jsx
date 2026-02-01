import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

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
      <div className={`${sizeConfig.icon} relative overflow-hidden rounded-xl`}>
        <img
          src={logoImg}
          alt="Streamify Logo"
          className="w-full h-full object-cover"
        />
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
