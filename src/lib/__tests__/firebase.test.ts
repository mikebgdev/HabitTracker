import { signInWithGoogle, signOutUser, getWeekdaySchedule } from '../firebase';
import { signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from 'firebase/auth';
jest.mock('@/lib/env');
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => {
  const actual = jest.requireActual('firebase/auth');
  return {
    ...actual,
    getAuth: jest.fn(() => ({})),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

describe('Firebase utilities', () => {
  it('signInWithGoogle calls signInWithPopup with auth and provider', async () => {
    await signInWithGoogle();
    expect(signInWithPopup).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('signOutUser calls firebaseSignOut with auth', async () => {
    await signOutUser();
    expect(firebaseSignOut).toHaveBeenCalledWith(expect.anything());
  });

  it('getWeekdaySchedule throws if routineId or userId are missing', async () => {
    await expect(getWeekdaySchedule('', '')).rejects.toThrow('Invalid routineId or userId');
  });
});