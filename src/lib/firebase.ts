import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type {
  Completion,
  Group,
  InsertCompletion,
  InsertGroup,
  InsertRoutine,
  InsertWeekdaySchedule,
  Routine,
  WeekdaySchedule,
} from '@/lib/types';

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

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}


export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(collection(db, 'groups'), where('userId', '==', userId));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Group, 'id'>),
  }));
}

export async function addGroup(
  data: Omit<InsertGroup, 'id' | 'createdAt'> & { userId: string },
): Promise<string> {
  const ref = await addDoc(collection(db, 'groups'), data);
  return ref.id;
}

export async function updateGroup(
  id: string,
  data: Partial<InsertGroup>,
): Promise<void> {
  await updateDoc(doc(db, 'groups', id), data);
}

export async function deleteGroup(id: string): Promise<void> {
  await deleteDoc(doc(db, 'groups', id));
}


export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const q = query(collection(db, 'routines'), where('userId', '==', userId));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Routine, 'id'>),
  }));
}

export async function addRoutine(
  data: Omit<InsertRoutine, 'id' | 'createdAt'> & { userId: string },
): Promise<string> {
  const ref = await addDoc(collection(db, 'routines'), data);
  return ref.id;
}

export async function updateRoutine(
  id: string,
  data: Partial<InsertRoutine>,
): Promise<void> {
  await updateDoc(doc(db, 'routines', id), data);
}

export async function deleteRoutine(id: string): Promise<void> {
  await deleteDoc(doc(db, 'routines', id));
}


export async function getWeekdaySchedule(
  routineId: string,
): Promise<WeekdaySchedule> {
  const snaps = await getDocs(
    query(
      collection(db, 'weekdaySchedules'),
      where('routineId', '==', routineId),
    ),
  );
  if (snaps.empty) {
    throw new Error(`No weekday schedule found for routine ${routineId}`);
  }
  const docSnap = snaps.docs[0];
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<WeekdaySchedule, 'id'>),
  };
}

export async function updateWeekdaySchedule(
  routineId: string,
  data: Omit<InsertWeekdaySchedule, 'id' | 'routineId'>,
): Promise<void> {
  const snaps = await getDocs(
    query(
      collection(db, 'weekdaySchedules'),
      where('routineId', '==', routineId),
    ),
  );
  if (!snaps.empty) {
    await updateDoc(doc(db, 'weekdaySchedules', snaps.docs[0].id), data);
  } else {
    await addDoc(collection(db, 'weekdaySchedules'), { routineId, ...data });
  }
}


function getDayRange(date: string) {
  return {
    startAt: `${date}T00:00:00.000Z`,
    endAt: `${date}T23:59:59.999Z`,
  };
}

export async function getCompletionsByDate(
  userId: string,
  date: string,
): Promise<Completion[]> {
  const { startAt, endAt } = getDayRange(date);

  const q = query(
    collection(db, 'completions'),
    where('userId', '==', userId),
    where('completedAt', '>=', startAt),
    where('completedAt', '<=', endAt),
  );

  try {
    const snaps = await getDocs(q);

    return snaps.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Completion, 'id'>),
    }));
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.error('Index missing:', err.message);
    } else {
      console.error('Error checking existing completions:', err);
    }
    return []
  }
}

export async function getCompletionsInRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<Completion[]> {
  const startAt = `${startDate}T00:00:00.000Z`;
  const endAt = `${endDate}T23:59:59.999Z`;
  const q = query(
    collection(db, 'completions'),
    where('userId', '==', userId),
    where('completedAt', '>=', startAt),
    where('completedAt', '<=', endAt),
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Completion, 'id'>),
  }));
}

export async function addCompletion(
  data: Omit<InsertCompletion, 'id'> & { userId: string },
): Promise<string> {
  const completedDate = data.completedAt.toDate().toISOString();

  try {
    const existing = await getDocs(
      query(
        collection(db, 'completions'),
        where('userId', '==', data.userId),
        where('routineId', '==', data.routineId),
        where('completedAt', '<=', completedDate),
        where('completedAt', '>=', completedDate),
      ),
    );

    for (const d of existing.docs) {
      await deleteDoc(doc(db, 'completions', d.id));
    }
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.error('Index missing:', err.message);
    } else {
      console.error('Error checking existing completions:', err);
    }
  }

  const ref = await addDoc(collection(db, 'completions'), {
    ...data,
    completedAt: completedDate,
  });

  return ref.id;
}

export async function removeCompletion(
  userId: string,
  routineId: string,
  date: string,
): Promise<void> {
  const { startAt, endAt } = getDayRange(date);
  const snaps = await getDocs(
    query(
      collection(db, 'completions'),
      where('userId', '==', userId),
      where('routineId', '==', routineId),
      where('completedAt', '>=', startAt),
      where('completedAt', '<=', endAt),
    ),
  );
  for (const d of snaps.docs) {
    await deleteDoc(doc(db, 'completions', d.id));
  }
}
