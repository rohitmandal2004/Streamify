import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = ''
}) => {

  const variants = {
    primary: "bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/25",
    secondary: "bg-surface hover:bg-white/10 text-white border border-white/10",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25",
    ghost: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  return (
    <motion.button
      type={type}
      className={`
        rounded-xl font-semibold transition-all flex items-center justify-center gap-2
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, translateY: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
};

export default Button;




