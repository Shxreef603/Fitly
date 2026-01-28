import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';

const EditMealModal = ({ meal, onClose, onSave }) => {
    const [name, setName] = useState(meal?.name ?? '');
    const [calories, setCalories] = useState(meal?.calories ?? 0);
    const [protein, setProtein] = useState(meal?.protein ?? 0);
    const [carbs, setCarbs] = useState(meal?.carbs ?? 0);
    const [fat, setFat] = useState(meal?.fat ?? 0);

    useEffect(() => {
        if (meal) {
            setName(meal.name ?? '');
            setCalories(Number(meal.calories) || 0);
            setProtein(Number(meal.protein) || 0);
            setCarbs(Number(meal.carbs) || 0);
            setFat(Number(meal.fat) || 0);
        }
    }, [meal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, calories, protein, carbs, fat });
    };

    if (!meal) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Edit meal</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-lime"
                            placeholder="Meal name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Calories</label>
                        <input
                            type="number"
                            min={0}
                            value={calories || ''}
                            onChange={(e) => setCalories(Number(e.target.value) || 0)}
                            className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Protein (g)</label>
                            <input
                                type="number"
                                min={0}
                                value={protein || ''}
                                onChange={(e) => setProtein(Number(e.target.value) || 0)}
                                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-lime"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Carbs (g)</label>
                            <input
                                type="number"
                                min={0}
                                value={carbs || ''}
                                onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Fat (g)</label>
                            <input
                                type="number"
                                min={0}
                                value={fat || ''}
                                onChange={(e) => setFat(Number(e.target.value) || 0)}
                                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-pink"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl font-semibold bg-neon-lime text-black hover:opacity-90 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditMealModal;
