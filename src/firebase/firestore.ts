import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { User } from 'firebase/auth';

// User profile data interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  occupation?: string;
  referralSource?: string;
  whatsappNumber?: string;
  onboardingCompleted: boolean;
  role: string; // 'admin' or 'tenant'
  createdAt: any;
  updatedAt: any;
  // ID property used in AdminDashboard component
  id?: string;
}

// Collection reference
const usersCollection = collection(db, 'users');

// Create a new user document in Firestore
export const createUserProfile = async (user: User): Promise<UserProfile> => {
  const userRef = doc(usersCollection, user.uid);
  
  const userData: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    onboardingCompleted: false,
    role: 'tenant', // Default role for new users
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  try {
    await setDoc(userRef, userData);
    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    // If we have permission errors, return the data anyway so the app doesn't break
    if (error instanceof Error && error.message.includes('permission')) {
      console.warn('Permission error when creating profile. Using default profile until rules are deployed.');
      return {
        ...userData,
        createdAt: null,
        updatedAt: null
      };
    }
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  // Check for empty or undefined user ID
  if (!uid) {
    console.error('Error getting user profile: User ID is empty or undefined');
    return null;
  }
  
  try {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    // If we have permission errors, it might be because the rules haven't been deployed yet
    // or the user doesn't have the right permissions
    if (error instanceof Error && error.message.includes('permission')) {
      console.warn('Permission error. Using default profile until rules are deployed.');
      // Return a default profile to prevent app from breaking
      return {
        uid: uid,
        email: '',
        onboardingCompleted: false,
        role: 'tenant',
        createdAt: null,
        updatedAt: null
      };
    }
    return null;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (
  uid: string, 
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(usersCollection, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Complete onboarding
export const completeOnboarding = async (
  uid: string,
  onboardingData: {
    occupation: string;
    referralSource: string;
    whatsapp: string;
    onboardingCompleted: boolean;
  }
): Promise<void> => {
  try {
    const userRef = doc(usersCollection, uid);
    await updateDoc(userRef, {
      occupation: onboardingData.occupation,
      referralSource: onboardingData.referralSource,
      whatsappNumber: onboardingData.whatsapp,
      onboardingCompleted: onboardingData.onboardingCompleted,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // If we have permission errors, log a warning but don't break the app flow
    if (error instanceof Error && error.message.includes('permission')) {
      console.warn('Permission error when completing onboarding. This would normally update the database.');
      // We'll pretend it succeeded to allow the user to continue using the app
      return;
    }
    throw error;
  }
};
