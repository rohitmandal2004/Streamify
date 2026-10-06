import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ 
  variant = 'default', 
  width = '100%', 
  height = '1rem',
  className = '' 
}) => {
  const variants = {
    default: 'rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded',
    card: 'rounded-2xl'
  };

  return (
    <motion.div
      className={`
        bg-white/5 border border-white/10
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
      animate={{
        background: [
          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
          'linear-gradient(90deg, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.05) 0%)',
          'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)'
        ],
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
    <LoadingSkeleton variant="circular" width="56px" height="56px" className="mb-6" />
    <LoadingSkeleton variant="text" width="60%" height="1.5rem" className="mb-4" />
    <LoadingSkeleton variant="text" width="100%" height="1rem" className="mb-2" />
    <LoadingSkeleton variant="text" width="80%" height="1rem" />
  </div>
);

export const ButtonSkeleton = ({ fullWidth = false }) => (
  <LoadingSkeleton 
    variant="default" 
    width={fullWidth ? '100%' : '120px'} 
    height="48px" 
    className="rounded-xl"
  />
);

export default LoadingSkeleton;

