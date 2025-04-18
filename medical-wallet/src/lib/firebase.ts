import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, AuthError, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getMessaging as getMessagingType, getToken, onMessage, Messaging } from 'firebase/messaging';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBjsV9-eGpFhQPU7h_aSqJQFqJ7Jkt_Xfo",
  authDomain: "medical-wallet-bb1b4.firebaseapp.com",
  projectId: "medical-wallet-bb1b4",
  storageBucket: "medical-wallet-bb1b4.appspot.com",
  messagingSenderId: "1039460737782",
  appId: "1:1039460737782:web:b4f85f11c707720c8d6e8a"
};

// Function to inject Firebase config into service worker
const injectFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.textContent = `
      self.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig)};
    `;
    document.head.appendChild(script);
  }
};

// Call the injection function
injectFirebaseConfig();

console.log('Firebase Config Loaded:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING'
});

// Initialize Firebase App only once
let app: FirebaseApp;
try {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      throw new Error('Missing required Firebase configuration. Check your environment variables.');
    }
    app = initializeApp(firebaseConfig);
    console.log('Firebase App Initialized successfully with config:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
  } else {
    app = getApp();
    console.log('Using existing Firebase App instance');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize services
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;
let messaging: Messaging | undefined;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
    messaging = getMessagingType(app);
  }
  console.log('Firebase Services Initialized successfully');
} catch (error) {
  console.error('Firebase service initialization error:', error);
  throw error;
}

// Admin email
const ADMIN_EMAIL = 'nsantosh897@gmail.com';

// User roles
export type UserRole = 'user' | 'doctor' | 'admin';

// User interface
export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Authentication functions
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'user' | 'doctor'
): Promise<{ success: boolean; message: string }> => {
  console.log('Attempting registration for:', email, 'with role:', role);
  try {
    if (!auth) {
      throw new Error('Firebase Auth service is not initialized. Check your Firebase configuration.');
    }

    // Check if email is admin email
    if (email === ADMIN_EMAIL) {
      return { success: false, message: 'This email is reserved for admin use.' };
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    const userData: User = {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    if (!db) {
      throw new Error('Firestore service is not initialized. Check your Firebase configuration.');
    }

    await setDoc(doc(db, 'users', user.uid), userData);
    await signOut(auth);

    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    console.error('Registration error:', error);
    
    const authError = error as AuthError;
    let message = 'Registration failed. Please try again.';

    if (authError?.code) {
      switch (authError.code) {
        case 'auth/email-already-in-use':
          message = 'Email already in use. Please use a different email or login.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format.';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password sign-up is not enabled. Please contact support.';
          break;
        case 'auth/configuration-not-found':
          message = 'Firebase configuration error. Please check your environment variables and Firebase Console settings.';
          break;
        default:
          message = `Registration failed: ${authError.message || 'Unknown error'}`;
      }
    }
    
    return { success: false, message };
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; role?: UserRole }> => {
  console.log('Attempting login for:', email);
  try {
    if (!auth) {
      console.error('Login Error: Firebase Auth service is not available.');
      throw new Error('Firebase Auth service is not available.');
    }
    console.log('Auth service check passed for login.');

    // Sign in with Firebase Auth
    console.log('Calling signInWithEmailAndPassword...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase Auth user signed in successfully:', user.uid);

    // Check if user is admin
    if (email === ADMIN_EMAIL) {
      console.log('Admin user logged in.');
      return { success: true, message: 'Login successful!', role: 'admin' };
    }

    // Get user data from Firestore
    if (!db) {
      console.error('Login Error: Firestore service is not available.');
      // Decide how critical DB is for login - maybe allow login but warn?
      throw new Error('Firestore service is not available. Cannot verify user role.');
    }
    console.log('Firestore service check passed for login.');

    console.log('Fetching Firestore document for user:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.warn('Login failed: User document not found in Firestore for UID:', user.uid);
      await signOut(auth); // Sign out if Firestore data is missing
      return { success: false, message: 'User data not found. Please register again or contact support.' };
    }

    const userData = userDoc.data() as User;
    console.log('User data fetched successfully, role:', userData.role);
    return { success: true, message: 'Login successful!', role: userData.role };
  } catch (error) {
    console.error('Login failed catastrophically:', error);
    
    const authError = error as AuthError;
    let message = 'Login failed. Please try again.';

    if (authError?.code) {
      console.error('Firebase Auth Error Code:', authError.code);
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': 
           message = 'Invalid email or password.';
           break;
        case 'auth/too-many-requests':
          message = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/configuration-not-found': // Explicitly handle this
           message = 'Firebase configuration error during login. Please contact support.';
           break;
        default:
          message = `Login failed: ${authError.message || 'Unknown Auth Error'}`;
      }
    } else if (error instanceof Error) {
      console.error('Non-Auth Error during login:', error.message);
      message = `Login failed: ${error.message || 'Unknown Error'}`;
    } else {
      console.error('Unknown error object during login:', error);
    }
    
    return { success: false, message };
  }
};

export const logoutUser = async (): Promise<void> => {
  console.log('Attempting logout...');
  try {
    if (!auth) {
      console.error('Logout Error: Firebase Auth service is not available.');
      // Don't necessarily throw, just can't perform Firebase logout
      return;
    }
    await signOut(auth);
    console.log('Logout successful.');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.error('Firebase messaging is not available');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) {
    console.error('Firebase messaging is not available');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Send crash notification
export const sendCrashNotification = async (data: {
  deviceId: string;
  crashType: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  location?: { lat: number; lng: number } | null;
}): Promise<{ success: boolean; message: string }> => {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    // Store crash notification in Firestore
    const crashRef = doc(db, 'crashes', crypto.randomUUID());
    await setDoc(crashRef, {
      ...data,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    // Here you would typically call your backend API to send the actual notification
    // For now, we'll just return success
    return {
      success: true,
      message: 'Crash notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending crash notification:', error);
    return {
      success: false,
      message: 'Failed to send crash notification'
    };
  }
};

export { app, auth, db, storage, analytics, ADMIN_EMAIL }; 