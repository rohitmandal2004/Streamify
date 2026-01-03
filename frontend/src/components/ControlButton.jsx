import React from 'react';
import { motion } from 'framer-motion';

const ControlButton = ({
  icon: Icon,
  onClick,
  tooltip,
  variant = 'default',
  active = false,
  badge = null,
  disabled = false
}) => {

  const getColors = () => {
    if (variant === 'danger') {
      return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30';
    }
    if (active) {
      return 'bg-white/20 hover:bg-white/30 text-white';
    }
    return 'bg-white/10 hover:bg-white/20 text-white';
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      onClick={disabled ? undefined : onClick}
      title={tooltip}
      disabled={disabled}
      className={`
        relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 touch-manipulation
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${getColors()}
      `}
    >
      {badge && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
          {badge}
        </span>
      )}
      <Icon fontSize={variant === 'default' ? 'medium' : 'medium'} />
    </motion.button>
  );
};

export default ControlButton;




