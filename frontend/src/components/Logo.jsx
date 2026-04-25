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
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
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
      <img src="/logo_new.png" alt="Streamify Logo" className={`${sizeConfig} w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]`} />
    </motion.div>
  );
};

export default Logo;
