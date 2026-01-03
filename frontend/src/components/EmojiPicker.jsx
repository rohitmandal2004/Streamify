import React from 'react';
import { motion } from 'framer-motion';

const emojis = ['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '👎', '👻', '🚀'];

const EmojiPicker = ({ onSelect, onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#202124] border border-white/20 rounded-2xl p-3 shadow-2xl flex gap-2 overflow-x-auto max-w-[90vw]"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
      >
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:bg-white/10 p-2 rounded-full transition-colors active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </motion.div>
    </>
  );
};

export default EmojiPicker;
