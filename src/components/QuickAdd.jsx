import React from 'react';
import { Plus } from 'lucide-react';

const QUICK_ITEMS = [
    { name: 'Whey Scoop', calories: 120, protein: 24, carbs: 3, fat: 1, icon: '💪' },
    { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, icon: '🍌' },
    { name: '2 Eggs', calories: 140, protein: 12, carbs: 1, fat: 10, icon: '🥚' },
    { name: 'Oats', calories: 150, protein: 5, carbs: 27, fat: 3, icon: '🥣' },
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, icon: '🍗' },
];

const QuickAdd = ({ onAdd }) => {
    return (
        <div className="mb-6 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar flex items-center gap-3">
            <div className="shrink-0 text-xs font-bold text-gray-500 uppercase tracking-widest mr-2 writing-mode-vertical-rl">
                Quick Add
            </div>

            {QUICK_ITEMS.map((item, i) => (
                <button
                    key={i}
                    onClick={() => onAdd(item)}
                    className="shrink-0 bg-white/5 hover:bg-neon-lime/20 border border-white/10 hover:border-neon-lime/50 rounded-2xl p-3 flex flex-col items-center min-w-[90px] transition-all group"
                >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-[10px] font-bold text-gray-300 group-hover:text-white text-center">{item.name}</span>
                    <div className="text-[8px] text-gray-500 mt-1 space-y-0.5 text-center">
                        <div>{item.calories} kcal</div>
                        <div className="text-neon-lime">P: {item.protein}g</div>
                        <div className="text-neon-cyan">C: {item.carbs}g</div>
                        <div className="text-neon-pink">F: {item.fat}g</div>
                    </div>

                    <div className="mt-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-neon-lime group-hover:text-black transition-colors">
                        <Plus size={12} strokeWidth={3} />
                    </div>
                </button>
            ))}
        </div>
    );
};

export default QuickAdd;
