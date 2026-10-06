import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';

const MeetingInfo = ({ meetingId, duration, participantCount, onInfoClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const meetingUrl = `${window.location.origin}/${meetingId}`;
    navigator.clipboard.writeText(meetingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!meetingId) return null;

  return (
    <motion.div
      className="bg-surface/60 backdrop-blur-md border border-white/10 pl-2 sm:pl-4 pr-1 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-3 shadow-lg hover:bg-surface/80 transition-colors flex-shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col leading-none">
        <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-wider uppercase">Meeting Code</span>
        <span className="text-xs sm:text-sm font-mono text-white tracking-wide">{meetingId}</span>
      </div>

      {duration && (
        <div className="hidden sm:flex flex-col leading-none border-l border-white/10 pl-2 sm:pl-3">
          <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-wider uppercase">Duration</span>
          <span className="text-xs sm:text-sm font-mono text-white tracking-wide">{duration}</span>
        </div>
      )}

      {participantCount !== undefined && (
        <div className="hidden sm:flex flex-col leading-none border-l border-white/10 pl-2 sm:pl-3">
          <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-wider uppercase">People</span>
          <span className="text-xs sm:text-sm font-mono text-white tracking-wide">{participantCount}</span>
        </div>
      )}

      <motion.button
        className={`
          flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold touch-manipulation
          ${copied ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-white hover:bg-white/20'}
          transition-colors
        `}
        onClick={handleCopy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CheckIcon fontSize="inherit" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ContentCopyIcon fontSize="inherit" />
            </motion.span>
          )}
        </AnimatePresence>
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </motion.button>

      {onInfoClick && (
        <motion.button
          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          onClick={onInfoClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <InfoIcon fontSize="small" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default MeetingInfo;




