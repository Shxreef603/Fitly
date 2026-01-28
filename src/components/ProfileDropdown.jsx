import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Target, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';

const ProfileDropdown = ({ user, onLogout, onEditGoals }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full border-2 border-neon-lime object-cover shadow-[0_0_10px_rgba(204,255,0,0.3)] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all overflow-hidden"
            >
                {user?.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-neon-lime/20 flex items-center justify-center text-xl text-neon-lime font-bold">
                        {user?.displayName?.charAt(0) || '👤'}
                    </div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50"
                    >
                        <div className="p-3 border-b border-white/10">
                            <p className="font-bold text-white truncate">{user?.displayName || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                        </div>

                        <div className="p-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsProfileOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                            >
                                <User size={18} className="text-gray-400" />
                                <span className="text-sm font-medium">Profile</span>
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsProfileOpen(true); // Share same modal for now or create settings
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                            >
                                <Settings size={18} className="text-gray-400" />
                                <span className="text-sm font-medium">Settings</span>
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onEditGoals();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                            >
                                <Target size={18} className="text-gray-400" />
                                <span className="text-sm font-medium">Edit Goals</span>
                            </button>
                        </div>

                        <div className="p-2 border-t border-white/10">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onLogout();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left text-red-500"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isProfileOpen && (
                    <ProfileModal onClose={() => setIsProfileOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
