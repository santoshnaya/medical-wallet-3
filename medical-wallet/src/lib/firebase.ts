import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, AuthError, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getMessaging as getMessagingType, getToken, onMessage, Messaging } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase Config Loaded:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING'
});

// Initialize Firebase App only once
let app: FirebaseApp;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase App Initialized for the first time.');
  } catch (error) {
    console.error('CRITICAL: Firebase App Initialization Failed:', error);
    // If app initialization fails, we can't proceed
    throw new Error('Could not initialize Firebase app.'); 
  }
} else {
  app = getApp();
  console.log('Firebase App already initialized.');
}

// Initialize services
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
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
  console.log('Firebase Services Initialized (Auth, DB, Storage)');
} catch (error) {
  console.error('CRITICAL: Firebase Service Initialization Failed:', error);
  // Decide how to handle service init failure - maybe auth can still work?
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
      console.error('Registration Error: Firebase Auth service is not available.');
      throw new Error('Firebase Auth service is not available. Initialization might have failed.');
    }
    console.log('Auth service check passed.');

    // Check if email is admin email
    if (email === ADMIN_EMAIL) {
      console.warn('Registration blocked: Admin email used.');
      return { success: false, message: 'This email is reserved for admin use.' };
    }
    console.log('Admin email check passed.');

    // Create user with Firebase Auth
    console.log('Calling createUserWithEmailAndPassword...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase Auth user created successfully:', user.uid);

    // Store user data in Firestore
    const userData: User = {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    if (!db) {
      console.error('Registration Error: Firestore service is not available.');
      // Decide if registration should fail if DB isn't available
      // For now, let's log and potentially continue if needed, but better to fail
      throw new Error('Firestore service is not available. Cannot save user data.');
    }
    console.log('Firestore service check passed.');

    console.log('Attempting to set Firestore document for user:', user.uid);
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('Firestore document set successfully.');

    // Sign out after registration
    console.log('Signing out user after registration...');
    await signOut(auth);
    console.log('User signed out successfully.');

    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    console.error('Registration failed catastrophically:', error);
    
    const authError = error as AuthError;
    let message = 'Registration failed. Please try again.';

    if (authError?.code) { // Check if authError and code exist
      console.error('Firebase Auth Error Code:', authError.code);
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
        case 'auth/operation-not-allowed': // Added this one
          message = 'Email/password sign-up is not enabled in your Firebase project.';
          break;
        case 'auth/configuration-not-found': // Explicitly handle this
           message = 'Firebase configuration error. Please check environment variables or contact support.'; // Updated message
           break;
        default:
          message = `Registration failed: ${authError.message || 'Unknown Auth Error'}`;
      }
    } else if (error instanceof Error) { // Handle generic errors
      console.error('Non-Auth Error during registration:', error.message);
      message = `Registration failed: ${error.message || 'Unknown Error'}`;
    } else {
      console.error('Unknown error object during registration:', error);
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