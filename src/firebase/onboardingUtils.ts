import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { auth } from './config';

/**
 * Force reset the onboarding status for the current user
 * This is a utility function to help with testing the onboarding flow
 */
export const resetOnboardingStatus = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is currently logged in');
      return false;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User document does not exist in Firestore');
      return false;
    }
    
    // Set onboardingCompleted to false
    await updateDoc(userRef, {
      onboardingCompleted: false
    });
    
     ('Successfully reset onboarding status to false');
    return true;
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
    return false;
  }
};

/**
 * Check the current onboarding status for the current user
 */
export const checkOnboardingStatus = async (): Promise<boolean | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is currently logged in');
      return null;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User document does not exist in Firestore');
      return null;
    }
    
    const userData = userDoc.data();
    return userData.onboardingCompleted;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return null;
  }
};
