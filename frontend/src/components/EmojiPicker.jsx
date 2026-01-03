import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const EMOJI_CATEGORIES = {
  'Recently Used': ['😀', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💯'],
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
  'Gestures': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Objects': ['💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂'],
};

const EmojiPicker = ({ onEmojiSelect, isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Recently Used');

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="w-full sm:w-80 h-64 sm:h-96 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Emoji</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xs"
          >
            Close
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-1 px-2 py-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                ${activeCategory === category
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
              <motion.button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl sm:text-2xl hover:bg-white/10 rounded-lg p-1.5 sm:p-2 transition-colors touch-manipulation"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiPicker;

