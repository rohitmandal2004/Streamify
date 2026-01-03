import React from 'react';
import { motion } from 'framer-motion';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const SelfVideo = ({ videoRef, username = 'You', audioEnabled = true, videoEnabled = true }) => {
  return (
    <motion.div
      className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-32 sm:w-48 md:w-56 aspect-video bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-40"
      style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
      initial={{ opacity: 0, scale: 0.8, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover mirror-mode"
      />
      
      {/* Status Indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {!audioEnabled && (
          <div className="bg-red-500 rounded-full p-1">
            <MicOffIcon style={{ fontSize: 14 }} className="text-white" />
          </div>
        )}
        {!videoEnabled && (
          <div className="bg-red-500 rounded-full p-1">
            <VideocamOffIcon style={{ fontSize: 14 }} className="text-white" />
          </div>
        )}
      </div>

      {/* Name Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2">
        <span className="text-xs sm:text-sm font-semibold text-white">
          {username} (You)
        </span>
      </div>
    </motion.div>
  );
};

export default SelfVideo;

