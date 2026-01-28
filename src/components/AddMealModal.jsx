import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { searchFoods } from '../lib/foodSearch';

const MOCK_FOODS = [
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, icon: '🍗' },
    { name: 'Oatmeal (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3, icon: '🥣' },
    { name: 'Whey Protein Scoop', calories: 120, protein: 24, carbs: 3, fat: 1, icon: '🥤' },
    { name: 'Avocado Toast', calories: 250, protein: 6, carbs: 30, fat: 12, icon: '🥑' },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, icon: '🍌' },
    { name: 'Rice (1 cup cooked)', calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4, icon: '🍚' },
    { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, icon: '🐟' },
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, icon: '🍎' },
    { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 23, carbs: 9, fat: 0, icon: '🥣' },
    { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1.2, fat: 10, icon: '🥚' },
    { name: 'Broccoli (1 cup)', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, icon: '🥦' },
    { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0, icon: '🍠' },
    { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14, icon: '🌰' },
    { name: 'Pizza Slice', calories: 285, protein: 12, carbs: 36, fat: 10, icon: '🍕' },
    { name: 'Burger', calories: 500, protein: 25, carbs: 45, fat: 25, icon: '🍔' },
    { name: 'Salad Bowl', calories: 150, protein: 3, carbs: 10, fat: 10, icon: '🥗' },
    { name: 'Pasta (1 cup)', calories: 220, protein: 8, carbs: 43, fat: 1.3, icon: '🍝' },
    { name: 'Steak (100g)', calories: 271, protein: 26, carbs: 0, fat: 19, icon: '🥩' },
    { name: 'Blueberries (1 cup)', calories: 85, protein: 1, carbs: 21, fat: 0.5, icon: '🫐' },
    { name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 6, icon: '🍫' },
];

const AddMealModal = ({ onClose, onAdd }) => {
    const [activeTab, setActiveTab] = useState('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [apiResults, setApiResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const q = searchQuery.trim();
        if (q.length < 2) {
            setApiResults([]);
            return;
        }
        const t = setTimeout(() => {
            setSearching(true);
            searchFoods(q, { limit: 15 })
                .then(setApiResults)
                .finally(() => setSearching(false));
        }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleAddFood = (food) => {
        const newMeal = {
            ...food,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        onAdd(newMeal);
        onClose();
    };

    const simulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            handleAddFood({
                name: 'AI Detected Bowl',
                calories: 450,
                protein: 35,
                carbs: 45,
                fat: 15,
                icon: '🥗',
            });
            setIsScanning(false);
        }, 2000);
    };

    const filteredMock = useMemo(
        () => MOCK_FOODS.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery]
    );
    const useApi = searchQuery.trim().length >= 2;
    const displayFoods = useApi ? apiResults : filteredMock;

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-6">Log Meal</h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors",
                            activeTab === 'search' ? "bg-neon-lime text-black font-semibold" : "bg-white/5 text-gray-400")}
                    >
                        <Search size={18} /> Search
                    </button>
                    <button
                        onClick={() => setActiveTab('photo')}
                        className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors",
                            activeTab === 'photo' ? "bg-neon-cyan text-black font-semibold" : "bg-white/5 text-gray-400")}
                    >
                        <Camera size={18} /> AI Scan
                    </button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === 'search' && (
                        <>
                            <input
                                type="text"
                                placeholder="Search any food (e.g., '3 eggs', 'Chicken box')..."
                                className="w-full bg-black border border-white/20 rounded-xl p-4 mb-2 text-white focus:outline-none focus:border-neon-lime"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {useApi && (
                                <p className="text-[10px] text-gray-500 mb-3">Instant AI Search • Powered by OpenRouter</p>
                            )}
                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                {searching && (
                                    <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
                                        <Loader2 size={20} className="animate-spin" />
                                        <span className="text-sm">Searching...</span>
                                    </div>
                                )}
                                {!searching && displayFoods.map((food, i) => (
                                    <button
                                        key={`${food.name}-${i}`}
                                        onClick={() => handleAddFood(food)}
                                        className="w-full text-left p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-colors"
                                    >
                                        <span className="text-2xl shrink-0">{food.icon ?? '🍽'}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">{food.name}</div>
                                            <div className="text-xs text-gray-400">{food.calories} kcal • {food.protein}g P • {food.carbs}g C</div>
                                        </div>
                                        <div className="w-8 h-8 shrink-0 rounded-full bg-neon-lime/10 text-neon-lime flex items-center justify-center">
                                            <Plus size={16} />
                                        </div>
                                    </button>
                                ))}
                                {!searching && displayFoods.length === 0 && (
                                    <div className="text-center text-gray-500 py-8">
                                        {useApi ? 'No products found. Try common names (e.g. milk, bread).' : 'No foods found.'}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'photo' && (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center">
                            {isScanning ? (
                                <>
                                    <div className="w-24 h-24 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-neon-cyan font-mono animate-pulse">Analyzing Macros...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-full h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-neon-cyan/50 transition-colors" onClick={simulateScan}>
                                        <Camera size={48} className="text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Tap to Scan Food</p>
                                    </div>
                                    <button onClick={simulateScan} className="w-full py-4 bg-neon-cyan text-black font-bold rounded-xl">
                                        Take Photo
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </motion.div>
        </motion.div>
    );
};

export default AddMealModal;
