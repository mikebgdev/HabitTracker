import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, } from 'firebase/auth';
import { getFirestore, collection, query, where, doc, getDocs, addDoc, updateDoc, deleteDoc, } from 'firebase/firestore';
// Firebase configuration initialized via VITE_FIREBASE_* environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
/**
 * Sign in with Google popup
 */
export async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}
/**
 * Sign out current user
 */
export async function signOutUser() {
    return firebaseSignOut(auth);
}
/**
 * Fetch groups for a user
 */
export async function getUserGroups(userId) {
    const q = query(collection(db, 'groups'), where('userId', '==', userId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => {
        const data = d.data();
        return { id: parseInt(d.id, 10), ...data };
    });
}
/**
 * Create a new group
 */
export async function addGroup(data) {
    const ref = await addDoc(collection(db, 'groups'), data);
    return ref.id;
}
/**
 * Update an existing group
 */
export async function updateGroup(id, data) {
    const ref = doc(db, 'groups', id.toString());
    await updateDoc(ref, data);
}
/**
 * Delete a group
 */
export async function deleteGroup(id) {
    await deleteDoc(doc(db, 'groups', id.toString()));
}
/**
 * Fetch routines for a user
 */
export async function getUserRoutines(userId) {
    const q = query(collection(db, 'routines'), where('userId', '==', userId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => {
        const data = d.data();
        return { id: parseInt(d.id, 10), ...data };
    });
}
/**
 * Create a new routine
 */
export async function addRoutine(data) {
    const ref = await addDoc(collection(db, 'routines'), data);
    return ref.id;
}
/**
 * Update an existing routine
 */
export async function updateRoutine(id, data) {
    const ref = doc(db, 'routines', id.toString());
    await updateDoc(ref, data);
}
/**
 * Delete a routine
 */
export async function deleteRoutine(id) {
    await deleteDoc(doc(db, 'routines', id.toString()));
}
/**
 * Fetch group-routine assignments
 */
export async function getGroupRoutines() {
    const snaps = await getDocs(collection(db, 'groupRoutines'));
    return snaps.docs.map((d) => {
        const data = d.data();
        return { id: parseInt(d.id, 10), ...data };
    });
}
/**
 * Assign a routine to a group
 */
export async function assignGroupToRoutine(data) {
    const ref = await addDoc(collection(db, 'groupRoutines'), data);
    return ref.id;
}
/**
 * Remove a group-routine assignment by id
 */
export async function removeGroupRoutine(id) {
    await deleteDoc(doc(db, 'groupRoutines', id.toString()));
}
/**
 * Fetch weekday schedule for a routine
 */
export async function getWeekdaySchedule(routineId) {
    const snaps = await getDocs(query(collection(db, 'weekdaySchedules'), where('routineId', '==', routineId)));
    const docSnap = snaps.docs[0];
    const data = docSnap?.data();
    return { id: parseInt(docSnap?.id ?? '0', 10), ...data };
}
/**
 * Update or create a weekday schedule for a routine
 */
export async function updateWeekdaySchedule(routineId, data) {
    const snaps = await getDocs(query(collection(db, 'weekdaySchedules'), where('routineId', '==', routineId)));
    if (snaps.docs.length > 0) {
        const ref = doc(db, 'weekdaySchedules', snaps.docs[0].id);
        await updateDoc(ref, data);
    }
    else {
        await addDoc(collection(db, 'weekdaySchedules'), { routineId, ...data });
    }
}
/**
 * Fetch completions for a user on a given date
 */
export async function getCompletionsByDate(userId, date) {
    const snaps = await getDocs(query(collection(db, 'completions'), where('userId', '==', userId), where('completedAt', '>=', date), where('completedAt', '<', date + 'T23:59:59.999Z')));
    return snaps.docs.map((d) => {
        const data = d.data();
        return { id: parseInt(d.id, 10), ...data };
    });
}
/**
 * Add a completion record
 */
export async function addCompletion(data) {
    const ref = await addDoc(collection(db, 'completions'), data);
    return ref.id;
}
/**
 * Remove a completion for a routine at a given date
 */
export async function removeCompletion(userId, routineId, date) {
    const snaps = await getDocs(query(collection(db, 'completions'), where('userId', '==', userId), where('routineId', '==', routineId), where('completedAt', '>=', date), where('completedAt', '<', date + 'T23:59:59.999Z')));
    for (const d of snaps.docs) {
        await deleteDoc(doc(db, 'completions', d.id));
    }
}
