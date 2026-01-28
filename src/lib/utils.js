import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function calculateStreak(meals) {
    if (!meals || meals.length === 0) return 0;

    const uniqueDates = [...new Set(meals.map(m => m.timestamp.split('T')[0]))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];

    let streak = 0;
    let currentDate = new Date();

    // Check if today or yesterday has a log
    const todayStr = currentDate.toISOString().split('T')[0];
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = currentDate.toISOString().split('T')[0];

    let checkDate = new Date();
    if (!uniqueDates.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    // If yesterday is also missing (and today is missing), streak is 0
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
        return 0;
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}
