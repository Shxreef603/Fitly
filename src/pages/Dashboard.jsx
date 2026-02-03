import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Flame, ChevronLeft, ChevronRight, Calendar, Copy, AlertCircle, X, Camera } from 'lucide-react';
import AddMealModal from '../components/AddMealModal';
import EditMealModal from '../components/EditMealModal';
import { useAuth } from '../context/AuthContext';
import ConsistencyCard from '../components/ConsistencyCard';
import PlanProgressCard from '../components/PlanProgressCard';
import QuickAdd from '../components/QuickAdd';
import MealTimeline from '../components/MealTimeline';
import ProfileDropdown from '../components/ProfileDropdown';
import PlanSelectionModal from '../components/PlanSelectionModal';
import EditGoalsModal from '../components/EditGoalsModal';
import ScanMealModal from '../components/ScanMealModal';
import ChatPanel from '../components/ChatPanel';
import FitlyAIButton from '../components/FitlyAIButton';
import { cn } from '../lib/utils';
import {
    initializeMealsData,
    addMealToSlot,
    removeMealFromSlot,
    updateMealInSlot,
    calculateTotals,
    toDateKey,
    parseDateKey,
} from '../lib/mealUtils';
import {
    getProfile,
    setProfile,
    getPlan,
    setPlan,
    getMealsForDate,
    setMealsForDate,
} from '../lib/firestore';
import { format, isToday, isYesterday } from 'date-fns';

const STORAGE_MEALS_BY_DATE = 'fitly_meals_by_date';

const loadMealsFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_MEALS_BY_DATE);
        if (raw) return JSON.parse(raw);
        const legacy = localStorage.getItem('fitly_meals_v2');
        if (legacy) {
            const day = JSON.parse(legacy);
            const key = toDateKey(new Date());
            const out = { [key]: day };
            localStorage.setItem(STORAGE_MEALS_BY_DATE, JSON.stringify(out));
            localStorage.removeItem('fitly_meals_v2');
            return out;
        }
    } catch (_) { }
    return {};
};

const saveMealsToStorage = (mealsByDate) => {
    localStorage.setItem(STORAGE_MEALS_BY_DATE, JSON.stringify(mealsByDate));
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const [localUser, setLocalUser] = useState(null);
    const [mealsByDate, setMealsByDate] = useState(loadMealsFromStorage);
    const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
    const [activePlan, setActivePlan] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editingMeal, setEditingMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showSyncFailedBanner, setShowSyncFailedBanner] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('fitly_sync_failed')) {
            sessionStorage.removeItem('fitly_sync_failed');
            setShowSyncFailedBanner(true);
        }
    }, []);

    const uid = authUser?.uid || null;
    const mealsForSelected = mealsByDate[selectedDate] || initializeMealsData();

    const persistMealsForDate = useCallback(
        async (dateKey, slotData) => {
            const next = { ...mealsByDate, [dateKey]: slotData };
            setMealsByDate(next);
            saveMealsToStorage(next);
            if (uid) {
                setSyncing(true);
                try {
                    await setMealsForDate(uid, dateKey, slotData);
                } finally {
                    setSyncing(false);
                }
            }
        },
        [uid, mealsByDate]
    );

    useEffect(() => {
        const storedUser = localStorage.getItem('fitly_user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        setLocalUser(JSON.parse(storedUser));
    }, [navigate]);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const [profile, plan, todayMeals] = await Promise.all([
                    getProfile(uid),
                    getPlan(uid),
                    getMealsForDate(uid, selectedDate),
                ]);
                if (cancelled) return;
                if (profile) {
                    const merged = {
                        ...JSON.parse(localStorage.getItem('fitly_user') || '{}'),
                        ...profile,
                    };
                    setLocalUser(merged);
                    localStorage.setItem('fitly_user', JSON.stringify(merged));
                }
                if (plan) {
                    setActivePlan(plan);
                    localStorage.setItem('fitly_active_plan', JSON.stringify(plan));
                }
                if (todayMeals) {
                    setMealsByDate((prev) => {
                        const next = { ...prev, [selectedDate]: todayMeals };
                        saveMealsToStorage(next);
                        return next;
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [uid, selectedDate]);

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('fitly_user');
        localStorage.removeItem('fitly_active_plan');
        navigate('/');
    };

    const handleAddMeal = (meal, slot) => {
        const targetSlot = slot || selectedSlot || 'breakfast';
        const newMeal = {
            ...meal,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        const updated = addMealToSlot(mealsForSelected, targetSlot, newMeal);
        persistMealsForDate(selectedDate, updated);
    };

    const handleDeleteMeal = (slot, mealId) => {
        const updated = removeMealFromSlot(mealsForSelected, slot, mealId);
        persistMealsForDate(selectedDate, updated);
    };

    const handleUpdateMeal = (slot, mealId, updates) => {
        const updated = updateMealInSlot(mealsForSelected, slot, mealId, updates);
        persistMealsForDate(selectedDate, updated);
        setEditingMeal(null);
    };

    const handleQuickAdd = (food) => {
        const slots = ['breakfast', 'lunch', 'snack', 'dinner'];
        const targetSlot = slots.find((s) => (mealsForSelected[s] || []).length === 0) || 'breakfast';
        handleAddMeal(food, targetSlot);
    };

    const handleSelectPlan = async (plan) => {
        const next = {
            type: plan.type,
            startDate: new Date().toISOString(),
            duration: plan.type === 'custom' ? (plan.duration ?? 30) : plan.duration,
        };
        setActivePlan(next);
        localStorage.setItem('fitly_active_plan', JSON.stringify(next));
        if (uid) await setPlan(uid, next);
    };

    const handleSaveGoals = async (newGoals) => {
        const updatedUser = {
            ...localUser,
            macros: { ...localUser.macros, ...newGoals },
        };
        setLocalUser(updatedUser);
        localStorage.setItem('fitly_user', JSON.stringify(updatedUser));
        if (uid) await setProfile(uid, updatedUser);
    };

    const handleSavePlan = async (updatedPlan) => {
        setActivePlan(updatedPlan);
        localStorage.setItem('fitly_active_plan', JSON.stringify(updatedPlan));
        if (uid) await setPlan(uid, updatedPlan);
    };

    const goPrevDay = () => {
        const d = parseDateKey(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(toDateKey(d));
    };

    const goNextDay = () => {
        const d = parseDateKey(selectedDate);
        d.setDate(d.getDate() + 1);
        const nextKey = toDateKey(d);
        if (nextKey <= toDateKey(new Date())) setSelectedDate(nextKey);
    };

    const copyYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const key = toDateKey(yesterday);
        const yesterdayData = mealsByDate[key];
        if (!yesterdayData) return;
        const slots = ['breakfast', 'lunch', 'snack', 'dinner'];
        const copied = { ...initializeMealsData() };
        slots.forEach((s) => {
            const list = yesterdayData[s] || [];
            copied[s] = list.map((m) => ({
                ...m,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
            }));
        });
        persistMealsForDate(selectedDate, copied);
    };

    const yesterdayKey = toDateKey((() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })());
    const canCopyYesterday = !!mealsByDate[yesterdayKey] && Object.values(mealsByDate[yesterdayKey] || {}).some((arr) => (arr || []).length > 0);
    const selectedD = parseDateKey(selectedDate);
    const isSelectedToday = isToday(selectedD);
    const isSelectedYesterday = isYesterday(selectedD);

    if (!localUser) return null;

    const totals = calculateTotals(mealsForSelected);

    return (
        <div className="min-h-screen bg-dark-base p-6 pb-24 text-white font-sans">
            <AnimatePresence>
                {showSyncFailedBanner && (
                    <motion.div
                        key="sync-failed-banner"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
                    >
                        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-amber-200">Profile saved on this device.</p>
                            <p className="text-xs text-gray-400 mt-0.5">Cloud sync didn’t complete. You can keep using the app; we’ll sync when possible.</p>
                        </div>
                        <button
                            onClick={() => setShowSyncFailedBanner(false)}
                            className="p-1.5 text-gray-400 hover:text-white rounded-lg shrink-0"
                            aria-label="Dismiss"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        Hi, {authUser?.displayName?.split(' ')[0] || 'Fit Fam'}{' '}
                        <span className="animate-wave origin-bottom-right inline-block">👋</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-sm">Let's crush today's goals.</p>
                </div>
                <ProfileDropdown
                    user={authUser}
                    onLogout={handleLogout}
                    onEditGoals={() => setIsEditGoalsOpen(true)}
                />
            </div>

            {/* Date nav + Today label */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goPrevDay}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                        aria-label="Previous day"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 min-w-[160px] justify-center">
                        <Calendar size={18} className="text-gray-500 shrink-0" />
                        <span className="font-semibold">
                            {format(selectedD, 'EEE, MMM d')}
                        </span>
                        {(isSelectedToday || isSelectedYesterday) && (
                            <span
                                className={cn(
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                                    isSelectedToday ? 'bg-neon-lime/20 text-neon-lime' : 'bg-white/10 text-gray-400'
                                )}
                            >
                                {isSelectedToday ? 'Today' : 'Yesterday'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={goNextDay}
                        disabled={isSelectedToday}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Next day"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                {isSelectedToday && canCopyYesterday && (
                    <button
                        onClick={copyYesterday}
                        className="text-xs font-semibold text-neon-cyan flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20"
                    >
                        <Copy size={14} /> Copy yesterday
                    </button>
                )}
            </div>
            {syncing && (
                <p className="text-[10px] text-gray-500 mb-2 flex items-center gap-1">Syncing…</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-8">
                <ConsistencyCard mealsData={mealsForSelected} mealsByDate={mealsByDate} />
                <PlanProgressCard
                    activePlan={activePlan}
                    onChoosePlan={() => setIsPlanModalOpen(true)}
                />
            </div>

            {loading ? (
                <div className="glass p-8 rounded-[2rem] flex items-center justify-center min-h-[200px]">
                    <div className="w-10 h-10 border-2 border-neon-lime border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <div className="mb-8">
                        <div className="glass p-6 rounded-[2rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                            Calories Remaining
                                        </p>
                                        <h2 className="text-5xl font-black text-white font-mono tracking-tighter">
                                            {(localUser.macros.calories - totals.calories).toLocaleString()}
                                        </h2>
                                        <p className="text-sm text-gray-400 font-medium mt-1">
                                            Consumed: <span className="text-white">{totals.calories}</span> / {localUser.macros.calories}
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
                                        <Flame size={32} fill="currentColor" className="opacity-80" />
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-[0_0_20px_rgba(255,165,0,0.4)] transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${Math.min(100, (totals.calories / (localUser.macros.calories || 1)) * 100)}%`,
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Protein', val: totals.protein, target: localUser.macros.protein, color: 'text-neon-lime', bg: 'bg-neon-lime' },
                                        { label: 'Carbs', val: totals.carbs, target: localUser.macros.carbs, color: 'text-neon-cyan', bg: 'bg-neon-cyan' },
                                        { label: 'Fats', val: totals.fat, target: localUser.macros.fat, color: 'text-neon-pink', bg: 'bg-neon-pink' },
                                    ].map((m) => (
                                        <div key={m.label} className="bg-black/20 rounded-xl p-3 flex flex-col justify-between">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">{m.label}</p>
                                            <div>
                                                <p className={cn('text-lg font-bold', m.color)}>{m.val}g</p>
                                                <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={cn('h-full rounded-full', m.bg)}
                                                        style={{ width: `${Math.min(100, ((m.val || 0) / (m.target || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-3">
                        <div className="flex-1">
                            <QuickAdd onAdd={handleQuickAdd} />
                        </div>
                        <button
                            onClick={() => setIsScanModalOpen(true)}
                            className="glass px-6 py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 font-semibold text-neon-lime"
                        >
                            <Camera size={20} />
                            Scan Meal
                        </button>
                    </div>

                    <div className="mb-24">
                        <div className="flex justify-between items-end mb-6 px-2">
                            <h3 className="text-2xl font-bold">
                                {isSelectedToday ? "Today's Timeline" : `${format(selectedD, 'MMM d')} Timeline`}
                            </h3>
                        </div>
                        {totals.calories === 0 && totals.protein === 0 && totals.carbs === 0 && totals.fat === 0 && (
                            <p className="text-sm text-gray-500 mb-4 px-2">
                                No meals logged for this day. Tap a meal slot below or use Quick Add to start.
                            </p>
                        )}
                        <MealTimeline
                            mealsData={mealsForSelected}
                            onLogClick={(slotId) => {
                                setSelectedSlot(slotId);
                                setIsAddModalOpen(true);
                            }}
                            onDeleteClick={handleDeleteMeal}
                            onEditClick={(slot, meal) => setEditingMeal({ slot, meal })}
                        />
                    </div>
                </>
            )}

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddMealModal
                        key="add-meal"
                        onClose={() => setIsAddModalOpen(false)}
                        onAdd={(meal) => {
                            handleAddMeal(meal, selectedSlot);
                            setIsAddModalOpen(false);
                        }}
                        onSwitchToScan={() => {
                            setIsAddModalOpen(false);
                            setIsScanModalOpen(true);
                        }}
                        initialSlot={selectedSlot}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {editingMeal && (
                    <EditMealModal
                        key="edit-meal"
                        meal={editingMeal.meal}
                        onClose={() => setEditingMeal(null)}
                        onSave={(updates) => handleUpdateMeal(editingMeal.slot, editingMeal.meal.id, updates)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isPlanModalOpen && (
                    <PlanSelectionModal
                        key="plan-modal"
                        onClose={() => setIsPlanModalOpen(false)}
                        onSelectPlan={handleSelectPlan}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isEditGoalsOpen && (
                    <EditGoalsModal
                        key="edit-goals"
                        currentGoals={localUser.macros}
                        activePlan={activePlan}
                        onClose={() => setIsEditGoalsOpen(false)}
                        onSave={handleSaveGoals}
                        onSavePlan={handleSavePlan}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isScanModalOpen && (
                    <ScanMealModal
                        key="scan-meal"
                        onClose={() => setIsScanModalOpen(false)}
                        onAdd={(meal, slot) => {
                            handleAddMeal(meal, slot);
                            setIsScanModalOpen(false);
                        }}
                        userGoals={localUser.macros}
                    />
                )}
            </AnimatePresence>

            <FitlyAIButton onClick={() => setIsChatOpen(true)} />

            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                userGoals={localUser.macros}
            />
        </div>
    );
};

export default Dashboard;
