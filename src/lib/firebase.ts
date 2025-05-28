import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import type {
  Routine,
  Group,
  GroupRoutine,
  WeekdaySchedule,
  Completion,
  InsertRoutine,
  InsertGroup,
  InsertGroupRoutine,
  InsertWeekdaySchedule,
  InsertCompletion,
} from '@/lib/types';

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
export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(collection(db, 'groups'), where('userId', '==', userId));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: parseInt(d.id, 10), ...(d.data() as Group) }));
}

/**
 * Create a new group
 */
export async function addGroup(data: Omit<InsertGroup, 'id' | 'createdAt'> & { userId: string }): Promise<string> {
  const ref = await addDoc(collection(db, 'groups'), data);
  return ref.id;
}

/**
 * Update an existing group
 */
export async function updateGroup(id: number, data: Partial<InsertGroup>): Promise<void> {
  const ref = doc(db, 'groups', id.toString());
  await updateDoc(ref, data);
}

/**
 * Delete a group
 */
export async function deleteGroup(id: number): Promise<void> {
  await deleteDoc(doc(db, 'groups', id.toString()));
}

/**
 * Fetch routines for a user
 */
export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const q = query(collection(db, 'routines'), where('userId', '==', userId));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: parseInt(d.id, 10), ...(d.data() as Routine) }));
}

/**
 * Create a new routine
 */
export async function addRoutine(
  data: Omit<InsertRoutine, 'id' | 'createdAt'> & { userId: string },
): Promise<string> {
  const ref = await addDoc(collection(db, 'routines'), data);
  return ref.id;
}

/**
 * Update an existing routine
 */
export async function updateRoutine(id: number, data: Partial<InsertRoutine>): Promise<void> {
  const ref = doc(db, 'routines', id.toString());
  await updateDoc(ref, data);
}

/**
 * Delete a routine
 */
export async function deleteRoutine(id: number): Promise<void> {
  await deleteDoc(doc(db, 'routines', id.toString()));
}

/**
 * Fetch group-routine assignments
 */
export async function getGroupRoutines(): Promise<GroupRoutine[]> {
  const snaps = await getDocs(collection(db, 'groupRoutines'));
  return snaps.docs.map((d) => ({ id: parseInt(d.id, 10), ...(d.data() as GroupRoutine) }));
}

/**
 * Assign a routine to a group
 */
export async function assignGroupToRoutine(
  data: Omit<InsertGroupRoutine, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'groupRoutines'), data);
  return ref.id;
}

/**
 * Remove a group-routine assignment by id
 */
export async function removeGroupRoutine(id: number): Promise<void> {
  await deleteDoc(doc(db, 'groupRoutines', id.toString()));
}

/**
 * Fetch weekday schedule for a routine
 */
export async function getWeekdaySchedule(
  routineId: number,
): Promise<WeekdaySchedule> {
  const snaps = await getDocs(
    query(collection(db, 'weekdaySchedules'), where('routineId', '==', routineId)),
  );
  const data = snaps.docs[0]?.data() as WeekdaySchedule;
  return { id: parseInt(snaps.docs[0]?.id ?? '0', 10), ...data };
}

/**
 * Update or create a weekday schedule for a routine
 */
export async function updateWeekdaySchedule(
  routineId: number,
  data: Omit<InsertWeekdaySchedule, 'id' | 'routineId'>,
): Promise<void> {
  const snaps = await getDocs(
    query(collection(db, 'weekdaySchedules'), where('routineId', '==', routineId)),
  );
  if (snaps.docs.length > 0) {
    const ref = doc(db, 'weekdaySchedules', snaps.docs[0].id);
    await updateDoc(ref, data);
  } else {
    await addDoc(collection(db, 'weekdaySchedules'), { routineId, ...data });
  }
}

/**
 * Fetch completions for a user on a given date
 */
export async function getCompletionsByDate(
  userId: string,
  date: string,
): Promise<Completion[]> {
  const snaps = await getDocs(
    query(
      collection(db, 'completions'),
      where('userId', '==', userId),
      where('completedAt', '>=', date),
      where('completedAt', '<', date + 'T23:59:59.999Z'),
    ),
  );
  return snaps.docs.map((d) => ({ id: parseInt(d.id, 10), ...(d.data() as Completion) }));
}

/**
 * Add a completion record
 */
export async function addCompletion(
  data: Omit<InsertCompletion, 'id'> & { userId: string },
): Promise<string> {
  const ref = await addDoc(collection(db, 'completions'), data);
  return ref.id;
}

/**
 * Remove a completion for a routine at a given date
 */
export async function removeCompletion(
  userId: string,
  routineId: number,
  date: string,
): Promise<void> {
  const snaps = await getDocs(
    query(
      collection(db, 'completions'),
      where('userId', '==', userId),
      where('routineId', '==', routineId),
      where('completedAt', '>=', date),
      where('completedAt', '<', date + 'T23:59:59.999Z'),
    ),
  );
  for (const d of snaps.docs) {
    await deleteDoc(doc(db, 'completions', d.id));
  }
}