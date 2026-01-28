export const ACTIVITY_LEVELS = {
    sedentary: { label: "Sedentary (Office job)", factor: 1.2 },
    light: { label: "Lightly Active (1-3 days/week)", factor: 1.375 },
    moderate: { label: "Moderately Active (3-5 days/week)", factor: 1.55 },
    very: { label: "Very Active (6-7 days/week)", factor: 1.725 },
    extra: { label: "Extra Active (Physical job)", factor: 1.9 },
};

export const GOALS = {
    cut: { label: "Lose Weight (Cut)", adjustment: -500 },
    maintain: { label: "Maintain Weight", adjustment: 0 },
    bulk: { label: "Gain Muscle (Bulk)", adjustment: 300 },
};

export function calculateMacros(userStats) {
    const { weight, height, age, gender, activity, goal } = userStats;

    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === "male" ? 5 : -161;

    const tdee = bmr * ACTIVITY_LEVELS[activity].factor;
    const targetCalories = Math.round(tdee + GOALS[goal].adjustment);

    // Macro Split (High Protein Focus)
    // Protein: 2.2g per kg of bodyweight (good for building/retaining muscle)
    // Fat: ~25% of calories
    // Carbs: Remainder

    const proteinGrams = Math.round(weight * 2.2);
    const fatCalories = targetCalories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);

    const consumedCalories = (proteinGrams * 4) + (fatGrams * 9);
    const remainingCalories = targetCalories - consumedCalories;
    const carbGrams = Math.max(0, Math.round(remainingCalories / 4));

    return {
        calories: targetCalories,
        protein: proteinGrams,
        carbs: carbGrams,
        fat: fatGrams,
    };
}
