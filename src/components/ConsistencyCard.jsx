import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { calculateStreak, calculateStreakFromMealsByDate, toDateKey } from '../lib/mealUtils';

const ConsistencyCard = ({ mealsData = {}, mealsByDate }) => {
    const streak = mealsByDate && Object.keys(mealsByDate).length > 0
        ? calculateStreakFromMealsByDate(mealsByDate)
        : calculateStreak(mealsData);

    const progressDots = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = toDateKey(d);
        const day = mealsByDate?.[key] || mealsData;
        const total = (day?.breakfast?.length || 0) + (day?.lunch?.length || 0) + (day?.snack?.length || 0) + (day?.dinner?.length || 0);
        progressDots.push(total > 0);
    }

    return (
        <div className="glass p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-lime/5 blur-3xl rounded-full group-hover:bg-neon-lime/10 transition-colors" />

            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Consistency</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white italic">{streak}</span>
                        <span className="text-sm text-gray-400 font-medium">Day Streak</span>
                    </div>
                </div>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border transition-all",
                    streak > 0 ? "bg-neon-lime text-black border-neon-lime shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "bg-white/5 text-gray-500 border-white/10"
                )}>
                    <Flame size={20} className={cn(streak > 0 && "animate-pulse")} />
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {progressDots.map((hasLog, i) => (
                    <div key={i} className="h-1.5 rounded-full overflow-hidden bg-white/10">
                        {hasLog && <div className="h-full w-full bg-neon-lime" />}
                    </div>
                ))}
            </div>

            {streak > 0 && (
                <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1">
                    <Trophy size={10} className="text-yellow-500" />
                    Keep it up! 🔥
                </p>
            )}
        </div>
    );
};

export default ConsistencyCard;
