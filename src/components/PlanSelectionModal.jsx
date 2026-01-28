import React, { useState } from 'react';
import { X, Calendar, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLAN_OPTIONS = [
    {
        type: '90-day',
        title: '90-Day Protein Plan',
        description: 'Build lasting habits over 3 months',
        duration: 90,
        icon: '🏆',
        color: 'neon-cyan'
    },
    {
        type: '7-day',
        title: '7-Day Protein Streak',
        description: 'Quick challenge to kickstart your journey',
        duration: 7,
        icon: '⚡',
        color: 'neon-lime'
    },
    {
        type: 'no-sugar',
        title: 'No Sugar Challenge',
        description: '30 days without added sugar',
        duration: 30,
        icon: '🍬',
        color: 'neon-pink'
    },
    {
        type: 'custom',
        title: 'Custom Plan',
        description: 'Set your own duration and goals',
        duration: null,
        icon: '⚙️',
        color: 'white'
    }
];

const PlanSelectionModal = ({ onClose, onSelectPlan }) => {
    const [customDuration, setCustomDuration] = useState(30);

    const handleSelectPlan = (plan) => {
        const activePlan = {
            type: plan.type,
            startDate: new Date().toISOString(),
            duration: plan.type === 'custom' ? customDuration : plan.duration
        };
        onSelectPlan(activePlan);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X size={24} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
                    <p className="text-gray-400 text-sm">Select a challenge to start tracking your progress</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLAN_OPTIONS.map((plan) => (
                        <div
                            key={plan.type}
                            onClick={() => handleSelectPlan(plan)}
                            className="glass p-5 rounded-2xl cursor-pointer hover:border-neon-cyan/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-2xl rounded-full group-hover:bg-neon-cyan/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="text-4xl mb-3">{plan.icon}</div>
                                <h3 className="font-bold text-lg mb-1">{plan.title}</h3>
                                <p className="text-xs text-gray-400 mb-3">{plan.description}</p>

                                {plan.type === 'custom' ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={customDuration}
                                            onChange={(e) => setCustomDuration(Number(e.target.value))}
                                            className="w-20 bg-black border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-neon-cyan"
                                        />
                                        <span className="text-sm text-gray-400">days</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-neon-cyan text-sm font-bold">
                                        <Calendar size={14} />
                                        {plan.duration} Days
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                        <Target size={14} className="text-neon-lime" />
                        You can change or cancel your plan anytime from settings
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PlanSelectionModal;
