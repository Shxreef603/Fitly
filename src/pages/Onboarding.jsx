import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateMacros, ACTIVITY_LEVELS, GOALS } from '../lib/nutrition';
import { cn } from '../lib/utils';
import { ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { setProfile } from '../lib/firestore';

const steps = [
    { id: 'welcome', title: "Let's Get Fitly", subtitle: "Your personal AI nutrition coach." },
    { id: 'basics', title: "The Basics", subtitle: "Tell us about yourself." },
    { id: 'stats', title: "Your Stats", subtitle: "Height & Weight." },
    { id: 'goal', title: "Your Goal", subtitle: "What are we chasing?" },
    { id: 'activity', title: "Activity Level", subtitle: "How much do you move?" },
];

const Onboarding = () => {
    const navigate = useNavigate();
    const { loginWithGoogle, user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        gender: 'male',
        age: 20,
        height: 175,
        weight: 70,
        goal: 'maintain',
        activity: 'moderate',
    });

    useEffect(() => {
        if (user) {
            // If user is already logged in, maybe skip to dashboard?
            // For now let's just let them go through onboarding
        }
    }, [user]);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            finishOnboarding();
        }
    };

    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isSaving) return;
        const profile = { ...formData, macros: calculateMacros(formData), joinedAt: new Date().toISOString() };
        localStorage.setItem('fitly_user', JSON.stringify(profile));
        if (user?.uid) {
            setProfile(user.uid, profile).catch(() => sessionStorage.setItem('fitly_sync_failed', '1'));
        }
        const t = setTimeout(() => {
            navigate('/dashboard');
        }, 400);
        return () => clearTimeout(t);
    }, [isSaving]);

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await loginWithGoogle();
            nextStep();
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.message || "Failed to sign in. Please try again.");
        }
    };

    const finishOnboarding = () => {
        setIsSaving(true);
    };

    // ... existing update function ...

    const update = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const StepIndicator = () => (
        <div className="flex gap-2 mb-8 justify-center">
            {steps.map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i <= currentStep ? "w-8 bg-neon-lime" : "w-4 bg-white/20"
                    )}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-neon-purple/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-neon-lime/10 blur-[120px] rounded-full pointer-events-none" />

            <StepIndicator />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md z-10"
                >
                    <h1 className="text-4xl font-bold text-white mb-2 text-center">{steps[currentStep].title}</h1>
                    <p className="text-gray-400 text-center mb-10">{steps[currentStep].subtitle}</p>

                    {/* Step 0: Welcome */}
                    {currentStep === 0 && (
                        <div className="text-center">
                            <div className="text-6xl mb-8 animate-bounce">🥑</div>
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                            {!user ? (
                                <button onClick={handleGoogleLogin} className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 mb-4">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                                    Continue with Google
                                </button>
                            ) : (
                                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-neon-lime/30">
                                    <p className="text-neon-lime">Welcome back, {user.displayName}!</p>
                                </div>
                            )}

                            <button onClick={nextStep} className="w-full py-4 bg-neon-lime text-black font-bold rounded-xl text-lg hover:opacity-90 transition-opacity">
                                Start My Journey
                            </button>
                        </div>
                    )}

                    {/* Step 1: Basics (Gender, Age) */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {['male', 'female'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => update('gender', g)}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                            formData.gender === g
                                                ? "border-neon-lime bg-neon-lime/10 text-neon-lime"
                                                : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
                                        )}
                                    >
                                        <span className="text-2xl">{g === 'male' ? '👨' : '👩'}</span>
                                        <span className="capitalize">{g}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="glass p-6 rounded-2xl">
                                <label className="block text-gray-400 mb-2 text-sm">Age</label>
                                <div className="flex items-center justify-between">
                                    <button onClick={() => update('age', Math.max(16, formData.age - 1))} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl hover:bg-white/20">-</button>
                                    <span className="text-3xl font-bold font-mono">{formData.age}</span>
                                    <button onClick={() => update('age', formData.age + 1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl hover:bg-white/20">+</button>
                                </div>
                            </div>

                            <button onClick={nextStep} className="w-full py-4 mt-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2">
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Stats (Height, Weight) */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {[
                                { label: 'Height (cm)', field: 'height', min: 120, max: 250 },
                                { label: 'Weight (kg)', field: 'weight', min: 40, max: 200 }
                            ].map((item) => (
                                <div key={item.field} className="glass p-6 rounded-2xl">
                                    <label className="block text-gray-400 mb-4 text-sm">{item.label}</label>
                                    <input
                                        type="range"
                                        min={item.min}
                                        max={item.max}
                                        value={formData[item.field]}
                                        onChange={(e) => update(item.field, Number(e.target.value))}
                                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-neon-lime"
                                    />
                                    <div className="text-center mt-4">
                                        <span className="text-4xl font-bold text-neon-lime font-mono">{formData[item.field]}</span>
                                    </div>
                                </div>
                            ))}
                            <button onClick={nextStep} className="w-full py-4 mt-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2">
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 3: Goal */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            {Object.entries(GOALS).map(([key, info]) => (
                                <button
                                    key={key}
                                    onClick={() => { update('goal', key); setTimeout(nextStep, 200); }}
                                    className={cn(
                                        "w-full p-5 rounded-xl border text-left transition-all",
                                        formData.goal === key
                                            ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                                            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{info.label}</span>
                                        {formData.goal === key && <Check size={20} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 4: Activity */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            {Object.entries(ACTIVITY_LEVELS).map(([key, info]) => (
                                <button
                                    key={key}
                                    onClick={() => update('activity', key)}
                                    className={cn(
                                        "w-full p-4 rounded-xl border text-left transition-all",
                                        formData.activity === key
                                            ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                                            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm">{info.label}</span>
                                        {formData.activity === key && <Check size={18} />}
                                    </div>
                                </button>
                            ))}
                            <button
                                onClick={nextStep}
                                disabled={isSaving}
                                className="w-full py-4 mt-8 bg-neon-lime text-black font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>Saving…</>
                                ) : (
                                    'Calculate Plan'
                                )}
                            </button>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
};


export default Onboarding;
