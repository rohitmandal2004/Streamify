import React from 'react';
import { motion } from 'framer-motion';

const ControlButton = ({
  icon: Icon,
  onClick,
  tooltip,
  variant = 'default',
  active = false,
  badge = null
}) => {

  const getColors = () => {
    if (variant === 'danger') {
      return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30';
    }
    if (active) {
      return 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/30';
    }
    return 'bg-surface hover:bg-white/10 text-gray-300 hover:text-white border border-white/5';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={tooltip}
      className={`
        relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
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



