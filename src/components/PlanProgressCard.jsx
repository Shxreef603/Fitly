import React from 'react';
import { Flag, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPlanProgress } from '../lib/mealUtils';

const PlanProgressCard = ({ activePlan, onChoosePlan }) => {
    if (!activePlan) {
        return (
            <div className="glass p-5 rounded-3xl relative overflow-hidden cursor-pointer hover:border-neon-cyan/30 transition-all" onClick={onChoosePlan}>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-neon-cyan/10 blur-2xl rounded-full" />

                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center relative z-10">
                    <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-3 border border-neon-cyan/20">
                        <Plus size={24} className="text-neon-cyan" />
                    </div>
                    <h3 className="text-white font-bold mb-1">Choose a Plan</h3>
                    <p className="text-xs text-gray-400">Start your journey</p>
                </div>
            </div>
        );
    }

    const { currentDay, totalDays, percentage } = getPlanProgress(activePlan);

    const planLabels = {
        '90-day': '90-DAY PLAN',
        '7-day': '7-DAY CHALLENGE',
        'no-sugar': 'NO SUGAR',
        'custom': 'CUSTOM PLAN'
    };

    return (
        <div className="glass p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-neon-cyan/10 blur-2xl rounded-full" />

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                        {planLabels[activePlan.type] || 'PLAN'}
                    </h3>
                    <p className="text-white font-bold text-lg">
                        Day {currentDay} <span className="text-gray-500 text-sm">/ {totalDays}</span>
                    </p>
                </div>
                <div className="px-2 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold border border-neon-cyan/20">
                    ACTIVE
                </div>
            </div>

            <p className="text-xs text-gray-300 mb-4 italic">"You're building a habit 💪"</p>

            {/* Visual Roadmap Line */}
            <div className="relative h-8 flex items-center mb-1">
                {/* Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 rounded-full" />
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-neon-cyan -translate-y-1/2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                />

                {/* Nodes */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neon-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.4)] z-10">
                    <CheckCircle2 size={10} className="text-black" />
                </div>

                {totalDays >= 30 && (
                    <div className={`absolute left-[33%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${currentDay >= totalDays * 0.33 ? 'bg-neon-cyan' : 'bg-dark-base border-2 border-white/20'} z-10`} />
                )}
                {totalDays >= 60 && (
                    <div className={`absolute left-[66%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${currentDay >= totalDays * 0.66 ? 'bg-neon-cyan' : 'bg-dark-base border-2 border-white/20'} z-10`} />
                )}

                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${currentDay >= totalDays ? 'bg-neon-cyan' : 'bg-dark-base border-2 border-gray-600'} flex items-center justify-center z-10`}>
                    <Flag size={8} className={currentDay >= totalDays ? 'text-black' : 'text-gray-500'} />
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>Start</span>
                <span>Finish</span>
            </div>
        </div>
    );
};

export default PlanProgressCard;
