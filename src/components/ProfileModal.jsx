import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2, Check, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../lib/utils';

const ProfileModal = ({ onClose }) => {
    const { user, updateUserProfile } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateUserProfile({ photoURL: downloadURL });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        setIsSaving(true);
        try {
            await updateUserProfile({ displayName });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1000);
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-lime/10 blur-[50px] rounded-full pointer-events-none" />

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <User className="text-neon-lime" size={24} />
                    Edit Profile
                </h2>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-white/5 overflow-hidden bg-white/5 flex items-center justify-center">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">{user?.displayName?.charAt(0) || '👤'}</span>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-neon-lime" size={24} />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neon-lime text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            <Camera size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Tap the camera to change photo</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-neon-lime transition-colors"
                            placeholder="Enter your name"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving || isUploading || !displayName.trim()}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                            success
                                ? "bg-green-500 text-white"
                                : "bg-neon-lime text-black hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : success ? (
                            <Check size={20} />
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProfileModal;
