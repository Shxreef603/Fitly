import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const EditGoalsModal = ({ currentGoals, activePlan, onClose, onSave, onSavePlan }) => {
    const [goals, setGoals] = useState({
        calories: Number(currentGoals.calories) || 2000,
        protein: Number(currentGoals.protein) || 150,
        carbs: Number(currentGoals.carbs) || 250,
        fat: Number(currentGoals.fat) || 70
    });

    const [planType, setPlanType] = useState(activePlan?.type || '90-day');
    const [planDuration, setPlanDuration] = useState(
        activePlan?.duration || 90
    );

    const PLAN_OPTIONS = [
        { type: '90-day', label: '90-Day Protein Plan', defaultDuration: 90 },
        { type: '7-day', label: '7-Day Protein Streak', defaultDuration: 7 },
        { type: 'no-sugar', label: 'No Sugar Challenge', defaultDuration: 30 },
        { type: 'custom', label: 'Custom Plan', defaultDuration: 30 }
    ];

    const handleInputChange = (field, value) => {
        // Allow empty string for clearing the field
        if (value === '') {
            setGoals(prev => ({ ...prev, [field]: '' }));
            return;
        }

        // Convert to number
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setGoals(prev => ({ ...prev, [field]: numValue }));
        }
    };

    const handleSave = () => {
        // Ensure all values are numbers (convert empty strings to 0)
        const sanitizedGoals = {
            calories: Number(goals.calories) || 0,
            protein: Number(goals.protein) || 0,
            carbs: Number(goals.carbs) || 0,
            fat: Number(goals.fat) || 0
        };

        onSave(sanitizedGoals);

        // Save plan if it changed and there's an active plan
        if (activePlan && onSavePlan) {
            const planChanged = planType !== activePlan.type || planDuration !== activePlan.duration;
            if (planChanged) {
                onSavePlan({
                    type: planType,
                    startDate: activePlan.startDate,
                    duration: planDuration
                });
            }
        }

        onClose();
    };

    const handleReset = () => {
        setGoals({
            calories: Number(currentGoals.calories) || 2000,
            protein: Number(currentGoals.protein) || 150,
            carbs: Number(currentGoals.carbs) || 250,
            fat: Number(currentGoals.fat) || 70
        });
        setPlanType(activePlan?.type || '90-day');
        setPlanDuration(activePlan?.duration || 90);
    };

    const handlePlanTypeChange = (newType) => {
        setPlanType(newType);
        const selectedPlan = PLAN_OPTIONS.find(p => p.type === newType);
        if (selectedPlan && newType !== 'custom') {
            setPlanDuration(selectedPlan.defaultDuration);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-[#181818] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Daily Goals</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="glass p-4 rounded-xl">
                        <label className="block text-sm font-bold text-gray-400 mb-2">Calories (kcal)</label>
                        <input
                            type="number"
                            min="0"
                            value={goals.calories}
                            onChange={(e) => handleInputChange('calories', e.target.value)}
                            className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <div className="glass p-4 rounded-xl">
                        <label className="block text-sm font-bold text-gray-400 mb-2">Protein (g)</label>
                        <input
                            type="number"
                            min="0"
                            value={goals.protein}
                            onChange={(e) => handleInputChange('protein', e.target.value)}
                            className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-lg font-bold focus:outline-none focus:border-neon-lime"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-xl">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Carbs (g)</label>
                            <input
                                type="number"
                                min="0"
                                value={goals.carbs}
                                onChange={(e) => handleInputChange('carbs', e.target.value)}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-lg font-bold focus:outline-none focus:border-neon-cyan"
                            />
                        </div>

                        <div className="glass p-4 rounded-xl">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Fats (g)</label>
                            <input
                                type="number"
                                min="0"
                                value={goals.fat}
                                onChange={(e) => handleInputChange('fat', e.target.value)}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-lg font-bold focus:outline-none focus:border-neon-pink"
                            />
                        </div>
                    </div>
                </div>

                {activePlan && (
                    <div className="space-y-4 mb-6">
                        <div className="glass p-4 rounded-xl">
                            <label className="block text-sm font-bold text-gray-400 mb-3">
                                Plan Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PLAN_OPTIONS.map((plan) => (
                                    <button
                                        key={plan.type}
                                        type="button"
                                        onClick={() => handlePlanTypeChange(plan.type)}
                                        className={`p-3 rounded-lg border-2 transition-all text-xs font-bold ${planType === plan.type
                                            ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        {plan.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass p-4 rounded-xl">
                            <label className="block text-sm font-bold text-gray-400 mb-2">
                                Duration (days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={planDuration}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val > 0) {
                                        setPlanDuration(val);
                                    }
                                }}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-lg font-bold focus:outline-none focus:border-neon-cyan"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {planType === 'custom' ? 'Set your own duration' : `Default: ${PLAN_OPTIONS.find(p => p.type === planType)?.defaultDuration} days`}
                            </p>
                        </div>
                    </div>
                )}

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                    <p className="text-xs text-gray-400">
                        💡 These are your daily targets. The system calculated these based on your profile, but you can adjust them to fit your needs.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-neon-lime text-black rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                    >
                        <Save size={18} />
                        Save Goals
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EditGoalsModal;
