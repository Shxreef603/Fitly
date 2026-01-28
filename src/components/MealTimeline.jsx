import React from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TIMELINE_SLOTS = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳', time: '8:00 AM' },
    { id: 'lunch', label: 'Lunch', icon: '🍛', time: '1:00 PM' },
    { id: 'snack', label: 'Snack', icon: '🍪', time: '4:00 PM' },
    { id: 'dinner', label: 'Dinner', icon: '🍽', time: '8:00 PM' },
];

const MealTimeline = ({ mealsData, onLogClick, onDeleteClick, onEditClick }) => {
    return (
        <div className="space-y-6 relative">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/10 rounded-full z-0" />

            {TIMELINE_SLOTS.map((slot) => {
                const slotMeals = mealsData[slot.id] || [];
                const isLogged = slotMeals.length > 0;

                return (
                    <div key={slot.id} className="relative z-10 flex gap-4">
                        {/* Timeline Node */}
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all shadow-lg shrink-0",
                            isLogged
                                ? "bg-neon-lime text-black border-neon-lime shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                                : "bg-dark-base border-white/10 text-gray-600 grayscale opacity-80"
                        )}>
                            {slot.icon}
                        </div>

                        {/* Content Card */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className={cn("font-bold text-lg", isLogged ? "text-white" : "text-gray-500")}>
                                    {slot.label}
                                </h4>
                                <span className="text-[10px] text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                    {slot.time}
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                {isLogged ? (
                                    <div className="space-y-2">
                                        {slotMeals.map((meal) => (
                                            <motion.div
                                                key={meal.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="glass p-3 rounded-xl border-l-4 border-l-neon-lime"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-white truncate">{meal.name}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {onEditClick && (
                                                            <button
                                                                onClick={() => onEditClick(slot.id, meal)}
                                                                className="p-2 text-gray-400 hover:text-neon-lime hover:bg-white/10 rounded-lg transition-colors"
                                                                aria-label="Edit meal"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => onDeleteClick(slot.id, meal.id)}
                                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/10 rounded-lg transition-colors"
                                                            aria-label="Delete meal"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <button
                                            onClick={() => onLogClick(slot.id)}
                                            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-all hover:border-neon-lime/30 hover:text-white"
                                        >
                                            <Plus size={14} /> Add More
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-2 mt-1"
                                    >
                                        <button
                                            onClick={() => onLogClick(slot.id)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all hover:border-neon-lime/30 hover:text-white"
                                        >
                                            <Plus size={14} /> Log Meal
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MealTimeline;
