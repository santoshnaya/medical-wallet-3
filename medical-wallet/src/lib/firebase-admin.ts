import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're in a server environment
const isServer = typeof window === 'undefined';

// Format the private key correctly
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  // If the key already has the correct format, return it
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    return key;
  }
  
  // Otherwise, format it correctly
  return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
};

// Only initialize Firebase Admin on the server side
const firebaseAdminConfig = isServer ? {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
} : null;

export function getFirebaseAdminApp() {
  if (!isServer) {
    return null;
  }
  
  if (getApps().length === 0) {
    if (!firebaseAdminConfig?.projectId || !firebaseAdminConfig?.clientEmail || !firebaseAdminConfig?.privateKey) {
      console.error('Firebase Admin configuration is missing required fields');
      return null;
    }
    
    try {
      return initializeApp({
        credential: cert(firebaseAdminConfig),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      return null;
    }
  }
  return getApps()[0];
}

export const adminDb = isServer ? getFirestore(getFirebaseAdminApp()) : null; 