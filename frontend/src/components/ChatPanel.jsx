import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';


const ChatPanel = ({ isOpen, onClose, messages, onSendMessage, currentUsername, newMessagesCount = 0 }) => {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');


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



  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-y-0 right-0 w-full sm:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <h2 className="font-semibold text-lg">Chat</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide">
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
                    className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-3`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <div className="flex items-end gap-2 max-w-[85%]">
                      {!isOwnMessage && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {item.sender ? item.sender[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        {!isOwnMessage && (
                          <div className="text-xs text-gray-400 mb-1 ml-1 flex items-center gap-2">
                            <span className="font-medium">{item.sender}</span>
                            {item.timestamp && (
                              <span className="text-[10px] opacity-70">{formatTime(item.timestamp)}</span>
                            )}
                          </div>
                        )}
                        <div className={`
                          px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                          ${isOwnMessage
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20'
                            : 'bg-white/10 text-gray-200 rounded-bl-sm backdrop-blur-sm'}
                        `}>
                          <span className="whitespace-pre-wrap">{item.data}</span>
                        </div>
                        {isOwnMessage && item.timestamp && (
                          <div className="text-[10px] text-gray-500 mt-1 mr-1 text-right">
                            {formatTime(item.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-black/20 relative safe-area-bottom">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
              <input
                type="text"
                className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-gray-500 outline-none"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="off"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`
                  p-1.5 rounded-full transition-all
                  ${message.trim()
                    ? 'text-indigo-400 hover:bg-indigo-500/20 hover:scale-110'
                    : 'text-gray-600 cursor-not-allowed'}
                `}
              >
                <SendIcon fontSize="small" />
              </button>
            </div>

          </div>
        </motion.div>
      )
      }
    </AnimatePresence>
  );
};

export default ChatPanel;




