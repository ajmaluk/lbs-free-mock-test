import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, type DocumentReference } from 'firebase/firestore';
import type { TestResult } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with extra logging
if (!firebaseConfig.apiKey) console.error('Firebase Error: VITE_FIREBASE_API_KEY is missing!');
if (!firebaseConfig.projectId) console.error('Firebase Error: VITE_FIREBASE_PROJECT_ID is missing!');

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const saveResult = async (result: TestResult) => {
  try {
    const submissionsRef = collection(db, 'submissions');
    
    const savePromise = addDoc(submissionsRef, {
      studentName: result.userData?.name || 'Unknown',
      phone: result.userData?.phone || 'Unknown',
      score: result.totalScore,
      categoryScores: result.categoryScores,
      allData: result,
      timestamp: serverTimestamp()
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Firebase connection timed out. This usually means either a slow internet connection or your Firebase Security Rules are blocking the write. Please ensure 'submissions' collection has public write access."));
      }, 15000);
    });

    const docRef = await Promise.race([savePromise, timeoutPromise]) as DocumentReference;
    return docRef.id;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Firebase error';
    const errorMsg = `FIREBASE ERROR: ${message}`;
    console.error(errorMsg);
    // alert(errorMsg); // Removed alert to keep UX smooth (non-blocking)
    return null;
  }
};
