import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const ProgressBar = ({ current, target, label, colorClass, unit = 'g' }) => {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));

    return (
        <div className="w-full mb-3">
            <div className="flex justify-between text-xs mb-1 text-gray-400">
                <span>{label}</span>
                <span>{Math.round(current)} / {target}{unit}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn("h-full rounded-full shadow-[0_0_10px_currentColor]", colorClass)}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
