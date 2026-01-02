import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const ChatPanel = ({ isOpen, onClose, messages, onSendMessage, currentUsername, newMessagesCount = 0 }) => {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-y-0 right-0 w-full sm:w-80 bg-surface/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
            <h2 className="font-bold text-lg">In-Call Messages</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-70">
                <p className="text-4xl mb-2">💬</p>
                <p className="font-medium">No messages yet</p>
                <span className="text-sm">Start the conversation!</span>
              </div>
            ) : (
              messages.map((item, index) => {
                const isOwnMessage = item.sender === currentUsername;
                return (
                  <motion.div
                    key={index}
                    className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {!isOwnMessage && (
                      <div className="text-xs text-gray-400 mb-1 ml-1">{item.sender}</div>
                    )}
                    <div className={`
                      max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed
                      ${isOwnMessage
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white/10 text-gray-200 rounded-bl-none'}
                    `}>
                      {item.data}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`
                  p-1.5 rounded-full transition-all
                  ${message.trim() ? 'text-primary hover:bg-primary/20' : 'text-gray-600 cursor-not-allowed'}
                `}
              >
                <SendIcon fontSize="small" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;



