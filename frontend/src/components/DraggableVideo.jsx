import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const DraggableVideo = ({ videoRef, username = 'You' }) => {
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain to viewport
    const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 300);
    const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 200);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed w-48 sm:w-64 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20 z-50 cursor-grab active:cursor-grabbing"
      style={{
        left: 0, // Utilize left/top with translate for better performance usually, but fixed position state updates work too
        x: position.x, // Framer Motion handles the transform
        y: position.y,
      }}
      drag={false} // We are implementing custom drag bounds that are cleaner
      dragMomentum={false}
      onMouseDown={handleMouseDown}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10 pointer-events-none">
        <span className="text-xs font-semibold text-white px-2 py-0.5 rounded bg-black/40 backdrop-blur-md">
          {username} (You)
        </span>
        <div className="text-white/50">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="10" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="10" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
            <circle cx="10" cy="10" r="1" />
          </svg>
        </div>
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover mirror-mode"
      />
    </motion.div>
  );
};

export default DraggableVideo;

