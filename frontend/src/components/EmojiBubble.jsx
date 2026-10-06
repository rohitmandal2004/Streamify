import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Randomize starting X slightly to avoid piling up
const getRandomX = () => Math.random() * 40 - 20;

const EmojiBubble = ({ emoji, onComplete }) => {
    return (
        <motion.div
            className="absolute bottom-20 left-8 sm:left-12 pointer-events-none z-50 text-4xl"
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                y: -300 + Math.random() * -100, // Float up 300-400px
                x: getRandomX()
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            onAnimationComplete={onComplete}
        >
            {emoji}
        </motion.div>
    );
};

export default EmojiBubble;
