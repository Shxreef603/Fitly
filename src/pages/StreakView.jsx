import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy } from 'lucide-react';
import { calculateStreakFromMealsByDate } from '../lib/mealUtils';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const CHALLENGES = [
    { id: 1, title: '7-Day Protein Streak', reward: '🔥 Badge', days: 7, color: 'bg-orange-500' },
    { id: 2, title: 'No Sugar Week', reward: '🍬 Badge', days: 7, color: 'bg-pink-500' },
    { id: 3, title: '30-Day Beast Mode', reward: '🦁 Trophy', days: 30, color: 'bg-neon-lime' },
];

const loadMealsByDate = () => {
    try {
        const raw = localStorage.getItem('fitly_meals_by_date');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const StreakView = () => {
    const navigate = useNavigate();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const mealsByDate = loadMealsByDate();
        setStreak(calculateStreakFromMealsByDate(mealsByDate));
    }, []);

    return (
        <div className="min-h-screen bg-dark-base p-6 text-white pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">Your Consistency</h1>
            </div>

            {/* Streak Hero */}
            <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="relative"
                >
                    <Flame size={120} className={cn("mb-4 filter drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]", streak > 0 ? "text-orange-500 animate-pulse" : "text-gray-600")} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-black pt-4">
                        {streak}
                    </div>
                </motion.div>

                <h2 className="text-3xl font-bold mb-1">{streak} Day Streak</h2>
                <p className="text-gray-400 text-sm">Keep the flame alive!</p>
            </div>

            {/* Challenges */}
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"> <Trophy size={20} className="text-yellow-400" /> Active Challenges</h3>
            <div className="space-y-4">
                {CHALLENGES.map((challenge) => (
                    <div key={challenge.id} className="glass p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                        <div className={cn("w-1 h-full absolute left-0 top-0", challenge.color)} />
                        <div className="flex-1">
                            <h4 className="font-bold text-lg">{challenge.title}</h4>
                            <p className="text-xs text-gray-400">Reward: {challenge.reward}</p>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                                <div className={cn("h-full w-[20%]", challenge.color)} />
                            </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-semibold hover:bg-white/10">
                            View
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StreakView;
