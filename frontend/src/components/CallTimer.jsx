import React, { useState, useEffect } from 'react';

const CallTimer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState('00:00:00');

    useEffect(() => {
        const interval = setInterval(() => {
            const totalSeconds = Math.floor((Date.now() - startTime) / 1000);

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const format = (num) => num.toString().padStart(2, '0');
            setElapsed(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div className="bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono tracking-wider">{elapsed}</span>
        </div>
    );
};

export default CallTimer;
