import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
console.log("Firebase: Initializing with Project ID:", firebaseConfig.projectId);
if (!firebaseConfig.apiKey) console.error("Firebase Error: VITE_FIREBASE_API_KEY is missing!");
if (!firebaseConfig.projectId) console.error("Firebase Error: VITE_FIREBASE_PROJECT_ID is missing!");

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const saveResult = async (result: any) => {
  console.log("Firebase: Attempting to save result for:", result.userData?.name);
  
  try {
    const submissionsRef = collection(db, "submissions");
    
    // Create the save promise
    const savePromise = addDoc(submissionsRef, {
      studentName: result.userData?.name || "Unknown",
      phone: result.userData?.phone || "Unknown",
      score: result.totalScore,
      categoryScores: result.categoryScores,
      allData: result,
      timestamp: serverTimestamp()
    });

    // 15-second timeout for extra safety (5s was too short for some connections)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Firebase connection timed out. This usually means either a slow internet connection or your Firebase Security Rules are blocking the write. Please ensure 'submissions' collection has public write access.")), 15000)
    );

    const docRef = await Promise.race([savePromise, timeoutPromise]) as any;
    
    const successMsg = `SUCCESS: Data saved for ${result.userData?.name}! ID: ${docRef.id}`;
    console.log(successMsg);
    // alert(successMsg); // Removed to avoid annoying user, but console will show it
    return docRef.id;

  } catch (e: any) {
    const errorMsg = `FIREBASE ERROR: ${e.message}`;
    console.error(errorMsg);
    alert(errorMsg); // This will tell us EXACTLY what is wrong
    return null;
  }
};
