import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Initializing Firebase Auth listener...");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
            setUser(currentUser ? { ...currentUser } : null); // Spread to trigger state update on profile changes
            setLoading(false);
        }, (error) => {
            console.error("Auth Listener Error:", error);
            setLoading(false);
        });

        // Safety timeout in case Firebase hangs
        const timer = setTimeout(() => {
            setLoading((l) => {
                if (l) {
                    console.warn("Auth listener timed out, forcing app load");
                    return false;
                }
                return l;
            });
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (error) {
            console.error("Context Login Error:", error);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserProfile = async (updates) => {
        if (!auth.currentUser) return;
        try {
            await updateProfile(auth.currentUser, updates);
            // Re-fetch or manually update local state since onAuthStateChanged might not fire for local profile changes
            setUser({ ...auth.currentUser });
        } catch (error) {
            console.error("Update Profile Error:", error);
            throw error;
        }
    };

    const value = {
        user,
        loginWithGoogle,
        logout,
        updateUserProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark-base text-white">
                    <div className="w-12 h-12 border-4 border-neon-lime border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 animate-pulse">Connecting to Fitly...</p>
                    <button
                        onClick={() => setLoading(false)}
                        className="mt-8 text-xs text-gray-500 hover:text-white underline"
                    >
                        Skip Wait (Dev Only)
                    </button>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
