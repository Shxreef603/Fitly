// Utility functions for streak and plan calculations

/** @param {Date} d */
export const toDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/** @param {string} dateKey - "YYYY-MM-DD" */
export const parseDateKey = (dateKey) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
};

/**
 * @param {Record<string, { breakfast?: any[], lunch?: any[], snack?: any[], dinner?: any[] }>} mealsByDate
 * @returns {number}
 */
export const calculateStreakFromMealsByDate = (mealsByDate) => {
    if (!mealsByDate || typeof mealsByDate !== 'object') return 0;
    const dateKeys = Object.keys(mealsByDate).filter((k) => {
        const day = mealsByDate[k];
        const total = (day?.breakfast?.length || 0) + (day?.lunch?.length || 0) + (day?.snack?.length || 0) + (day?.dinner?.length || 0);
        return total > 0;
    });
    if (dateKeys.length === 0) return 0;
    const todayKey = toDateKey(new Date());
    const seen = new Set(dateKeys);
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = toDateKey(d);
        if (seen.has(key)) streak++;
        else break;
    }
    return streak;
};

export const calculateStreak = (mealsData) => {
    // mealsData structure: { breakfast: [], lunch: [], snack: [], dinner: [] }
    // Check consecutive days with at least one meal logged

    if (!mealsData || typeof mealsData !== 'object') return 0;

    // Get all meals from all slots
    const allMeals = [
        ...(mealsData.breakfast || []),
        ...(mealsData.lunch || []),
        ...(mealsData.snack || []),
        ...(mealsData.dinner || [])
    ];

    if (allMeals.length === 0) return 0;

    // Group meals by date
    const byDate = {};
    allMeals.forEach(meal => {
        if (meal.timestamp) {
            const date = new Date(meal.timestamp).toDateString();
            byDate[date] = true;
        }
    });

    // Calculate consecutive days from today backwards
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();

        if (byDate[dateStr]) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

export const getPlanProgress = (activePlan) => {
    if (!activePlan || !activePlan.startDate) {
        return { currentDay: 0, totalDays: 0, percentage: 0 };
    }

    const startDate = new Date(activePlan.startDate);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.max(1, Math.min(daysPassed, activePlan.duration));

    return {
        currentDay,
        totalDays: activePlan.duration,
        percentage: (currentDay / activePlan.duration) * 100
    };
};

export const initializeMealsData = () => {
    return {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: []
    };
};

export const addMealToSlot = (mealsData, slot, meal) => {
    const newMealsData = { ...mealsData };
    if (!newMealsData[slot]) {
        newMealsData[slot] = [];
    }
    newMealsData[slot] = [...newMealsData[slot], meal];
    return newMealsData;
};

export const removeMealFromSlot = (mealsData, slot, mealId) => {
    const newMealsData = { ...mealsData };
    if (newMealsData[slot]) {
        newMealsData[slot] = newMealsData[slot].filter(m => m.id !== mealId);
    }
    return newMealsData;
};

/**
 * @param {object} mealsData - slot map
 * @param {string} slot
 * @param {string} mealId
 * @param {object} updates - partial meal { name?, calories?, protein?, carbs?, fat?, icon? }
 */
export const updateMealInSlot = (mealsData, slot, mealId, updates) => {
    const newMealsData = { ...mealsData };
    if (!newMealsData[slot]) return newMealsData;
    newMealsData[slot] = newMealsData[slot].map((m) =>
        m.id === mealId ? { ...m, ...updates } : m
    );
    return newMealsData;
};

export const calculateTotals = (mealsData) => {
    const allMeals = [
        ...(mealsData.breakfast || []),
        ...(mealsData.lunch || []),
        ...(mealsData.snack || []),
        ...(mealsData.dinner || [])
    ];

    return allMeals.reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};
