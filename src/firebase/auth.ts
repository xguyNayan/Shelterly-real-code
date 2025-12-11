import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';

// Register a new user with email and password
export const registerWithEmailAndPassword = async (
  email: string, 
  password: string, 
  fullName: string
): Promise<User> => {
  try {
    // First create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Then update the user profile with the full name
    if (userCredential.user) {
      try {
        // Update Firebase Auth profile
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
        console.log(`Display name set successfully in Firebase Auth: ${fullName}`);
        
        // Create user profile in Firestore
        try {
          await createUserProfile({
            ...userCredential.user,
            displayName: fullName // Explicitly set displayName to ensure it's included
          });
          console.log(`User profile created in Firestore with displayName: ${fullName}`);
        } catch (firestoreError) {
          console.error("Error creating user profile in Firestore:", firestoreError);
          // Continue despite Firestore error - the account is still created in Firebase Auth
        }
      } catch (profileError) {
        console.error("Error setting display name:", profileError);
        // Continue despite profile update error - the account is still created
      }
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Sign in with email and password
export const loginWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out the current user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
