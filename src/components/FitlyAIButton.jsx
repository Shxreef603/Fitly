import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const FitlyAIButton = ({ onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-neon-lime to-neon-cyan text-black font-bold shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:shadow-[0_0_40px_rgba(204,255,0,0.6)] transition-shadow"
        >
            <Sparkles size={20} />
            <span>Fitly AI</span>
        </motion.button>
    );
};

export default FitlyAIButton;
