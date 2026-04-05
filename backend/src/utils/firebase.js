import admin from 'firebase-admin';

let firebaseApp = null;

export const initializeFirebase = () => {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('Firebase configuration missing from environment variables');
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('⚠️  Firebase initialization warning (auth may be disabled):', error.message);
    // Don't exit - allow app to run without Firebase if not configured
  }
};

export const getFirebaseApp = () => firebaseApp;

export const verifyFirebaseToken = async (token) => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }
  return await admin.auth().verifyIdToken(token);
};
