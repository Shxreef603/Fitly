import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Upload, Loader2, AlertCircle } from 'lucide-react';
import { scanMeal } from '../lib/aiApi';
import { cn } from '../lib/utils';

const ScanMealModal = ({ onClose, onAdd, userGoals }) => {
    const [step, setStep] = useState('upload'); // upload, preview, analyzing, results
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [scanResults, setScanResults] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState('breakfast');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setStep('preview');
            setError(null);
        }
    };

    const openCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStep('camera');
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Failed to access camera. Please ensure camera permissions are granted.');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                setSelectedImage(file);
                setImagePreview(URL.createObjectURL(file));
                stopCamera();
                setStep('preview');
            }, 'image/jpeg', 0.9);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const analyzeMeal = async () => {
        if (!selectedImage) return;

        setIsLoading(true);
        setStep('analyzing');
        setError(null);

        try {
            const results = await scanMeal(selectedImage, userGoals);
            setScanResults(results);
            setStep('results');
        } catch (err) {
            console.error('Scan error:', err);
            setError(err.message || 'Failed to analyze meal. Please try again.');
            setStep('preview');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToTimeline = () => {
        if (!scanResults) return;

        const meal = {
            name: scanResults.meal_name,
            calories: scanResults.nutrition_estimate.calories_kcal,
            protein: scanResults.nutrition_estimate.protein_g,
            carbs: scanResults.nutrition_estimate.carbs_g,
            fat: scanResults.nutrition_estimate.fat_g,
        };

        onAdd(meal, selectedSlot);
        handleClose();
    };

    const handleClose = () => {
        stopCamera();
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-[2rem] p-6 relative"
            >
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Camera className="text-neon-lime" size={28} />
                    Scan Meal
                </h2>

                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                )}

                {/* Upload Options */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-8 rounded-2xl bg-gradient-to-br from-neon-lime/10 to-neon-cyan/10 border-2 border-neon-lime/30 hover:border-neon-lime/50 transition-all flex flex-col items-center gap-3"
                        >
                            <Upload size={48} className="text-neon-lime" />
                            <div>
                                <p className="font-bold text-lg">Upload Meal Photo</p>
                                <p className="text-sm text-gray-400">Choose from your device</p>
                            </div>
                        </button>

                        <button
                            onClick={openCamera}
                            className="w-full p-8 rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 border-2 border-neon-cyan/30 hover:border-neon-cyan/50 transition-all flex flex-col items-center gap-3"
                        >
                            <Camera size={48} className="text-neon-cyan" />
                            <div>
                                <p className="font-bold text-lg">Open Camera</p>
                                <p className="text-sm text-gray-400">Take a photo now</p>
                            </div>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Camera View */}
                {step === 'camera' && (
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={capturePhoto}
                                className="flex-1 py-3 rounded-xl bg-neon-lime text-black font-bold hover:bg-neon-lime/90 transition-colors"
                            >
                                Capture Photo
                            </button>
                            <button
                                onClick={() => {
                                    stopCamera();
                                    setStep('upload');
                                }}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {/* Preview */}
                {step === 'preview' && imagePreview && (
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden">
                            <img src={imagePreview} alt="Meal preview" className="w-full" />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={analyzeMeal}
                                disabled={isLoading}
                                className="flex-1 py-3 rounded-xl bg-neon-lime text-black font-bold hover:bg-neon-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : null}
                                Analyze Meal
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                    setStep('upload');
                                }}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Retake
                            </button>
                        </div>
                    </div>
                )}

                {/* Analyzing */}
                {step === 'analyzing' && (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 size={48} className="animate-spin text-neon-lime" />
                        <p className="text-lg font-semibold">Scanning your meal...</p>
                        <p className="text-sm text-gray-400">Analyzing nutrition content</p>
                    </div>
                )}

                {/* Results */}
                {step === 'results' && scanResults && (
                    <div className="space-y-6">
                        {/* Detected Foods */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">Detected Foods</h3>
                            <div className="space-y-2">
                                {scanResults.foods_detected.map((food, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                                        <div>
                                            <p className="font-medium">{food.name}</p>
                                            <p className="text-xs text-gray-400">{food.portion}</p>
                                        </div>
                                        <span className="text-sm font-bold text-neon-lime">
                                            {Math.round(food.confidence * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Meal Summary */}
                        <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
                            <p className="text-sm font-semibold text-neon-cyan mb-1">This looks like:</p>
                            <p className="text-white">{scanResults.meal_name}</p>
                        </div>

                        {/* Nutrition Breakdown */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">Nutritional Breakdown</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Calories', value: scanResults.nutrition_estimate.calories_kcal, unit: 'kcal', color: 'text-orange-400' },
                                    { label: 'Protein', value: scanResults.nutrition_estimate.protein_g, unit: 'g', color: 'text-neon-lime' },
                                    { label: 'Carbs', value: scanResults.nutrition_estimate.carbs_g, unit: 'g', color: 'text-neon-cyan' },
                                    { label: 'Fat', value: scanResults.nutrition_estimate.fat_g, unit: 'g', color: 'text-neon-pink' },
                                    { label: 'Fiber', value: scanResults.nutrition_estimate.fiber_g, unit: 'g', color: 'text-green-400' },
                                    { label: 'Sugar', value: scanResults.nutrition_estimate.sugar_g, unit: 'g', color: 'text-yellow-400' },
                                    { label: 'Sodium', value: scanResults.nutrition_estimate.sodium_mg, unit: 'mg', color: 'text-purple-400' },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-xl bg-white/5">
                                        <p className="text-xs text-gray-400 uppercase">{item.label}</p>
                                        <p className={cn('text-xl font-bold', item.color)}>
                                            {item.value}
                                            <span className="text-sm ml-1">{item.unit}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-xs text-gray-500 text-center italic">
                            Nutrition values are estimates based on AI analysis.
                        </p>

                        {/* Add to Timeline */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold">Add to:</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['breakfast', 'lunch', 'snack', 'dinner'].map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={cn(
                                            'py-2 px-3 rounded-xl font-medium text-sm capitalize transition-all',
                                            selectedSlot === slot
                                                ? 'bg-neon-lime text-black'
                                                : 'bg-white/5 hover:bg-white/10'
                                        )}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleAddToTimeline}
                                className="w-full py-3 rounded-xl bg-neon-lime text-black font-bold hover:bg-neon-lime/90 transition-colors"
                            >
                                Add to Timeline
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ScanMealModal;
