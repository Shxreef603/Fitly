import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const PROFILES = "profiles";
const MEALS = "meals";
const PLAN = "plan";

/**
 * Get user profile from Firestore
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<object|null>}
 */
export async function getProfile(uid) {
    if (!uid) return null;
    try {
        const ref = doc(db, "users", uid, PROFILES, "default");
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
        console.warn("Firestore getProfile error:", e);
        return null;
    }
}

/**
 * Save user profile to Firestore
 * @param {string} uid
 * @param {object} data - { macros, gender, age, height, weight, goal, activity, joinedAt }
 */
export async function setProfile(uid, data) {
    if (!uid) return;
    try {
        const ref = doc(db, "users", uid, PROFILES, "default");
        await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
        console.warn("Firestore setProfile error:", e);
    }
}

/**
 * Get active plan from Firestore
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getPlan(uid) {
    if (!uid) return null;
    try {
        const ref = doc(db, "users", uid, PLAN, "active");
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.warn("Firestore getPlan error:", e);
        return null;
    }
}

/**
 * Save active plan to Firestore
 * @param {string} uid
 * @param {object} plan - { type, startDate, duration }
 */
export async function setPlan(uid, plan) {
    if (!uid) return;
    try {
        const ref = doc(db, "users", uid, PLAN, "active");
        await setDoc(ref, { ...plan, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
        console.warn("Firestore setPlan error:", e);
    }
}

/**
 * Get meals for a given date (YYYY-MM-DD)
 * @param {string} uid
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {Promise<{ breakfast: [], lunch: [], snack: [], dinner: [] }>}
 */
export async function getMealsForDate(uid, dateKey) {
    if (!uid) return { breakfast: [], lunch: [], snack: [], dinner: [] };
    try {
        const ref = doc(db, "users", uid, MEALS, dateKey);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        return {
            breakfast: data.breakfast || [],
            lunch: data.lunch || [],
            snack: data.snack || [],
            dinner: data.dinner || [],
        };
    } catch (e) {
        console.warn("Firestore getMealsForDate error:", e);
        return { breakfast: [], lunch: [], snack: [], dinner: [] };
    }
}

/**
 * Save meals for a given date
 * @param {string} uid
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {object} slotData - { breakfast, lunch, snack, dinner }
 */
export async function setMealsForDate(uid, dateKey, slotData) {
    if (!uid) return;
    try {
        const ref = doc(db, "users", uid, MEALS, dateKey);
        await setDoc(ref, { ...slotData, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
        console.warn("Firestore setMealsForDate error:", e);
    }
}
