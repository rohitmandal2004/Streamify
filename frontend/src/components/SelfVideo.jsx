import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const SelfVideo = ({ videoRef, username = 'You', audioEnabled = true, videoEnabled = true }) => {
  const constraintsRef = useRef(null);

  return (
    <>
      {/* Constraints container for dragging */}
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-40" />

      <motion.div
        className="fixed bottom-24 right-4 w-32 sm:w-40 md:w-56 aspect-[3/4] sm:aspect-video bg-[#202124] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50 cursor-grab active:cursor-grabbing"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {videoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#303030]">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-white font-bold text-xl">
              {username[0]?.toUpperCase()}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {!audioEnabled && (
            <div className="bg-[#ea4335] rounded-full p-1.5 shadow-sm">
              <MicOffIcon style={{ fontSize: 14 }} className="text-white block" />
            </div>
          )}
        </div>

        {/* Name Label - Only show if not video to avoid clutter, or show minimal */}
        <div className="absolute bottom-2 left-2 text-white/90 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
          You
        </div>
      </motion.div>
    </>
  );
};

export default SelfVideo;
