import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from './firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './config';

/**
 * Creates an admin user if it doesn't already exist
 * @param email Admin email
 * @param password Admin password
 * @param displayName Admin display name
 */
export const createAdminUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<void> => {
  try {
    // Check if user exists in auth
    let adminUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      adminUser = userCredential.user;
      
      // Update display name
      await updateProfile(adminUser, {
        displayName: displayName
      });
      
       ('Admin user created in Firebase Auth');
    } catch (error: any) {
      // If error is because user already exists, we can continue
      if (error.code === 'auth/email-already-in-use') {
         ('Admin user already exists in Firebase Auth');
      } else {
        throw error;
      }
    }
    
    // Check if admin document exists in Firestore
    const adminDocRef = doc(db, 'users', email.replace('@', '_at_'));
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
      // Create admin document in Firestore
      const adminData: UserProfile = {
        uid: email.replace('@', '_at_'),
        email: email,
        displayName: displayName,
        role: 'admin',
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(adminDocRef, adminData);
       ('Admin user created in Firestore');
    } else {
      // Update role to admin if not already
      const userData = adminDoc.data() as UserProfile;
      if (userData.role !== 'admin') {
        await setDoc(adminDocRef, { 
          ...userData, 
          role: 'admin',
          updatedAt: new Date()
        });
         ('Updated existing user to admin role');
      } else {
         ('Admin user already exists in Firestore');
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Checks if a user has admin role
 * @param userProfile User profile to check
 * @returns Boolean indicating if user is an admin
 */
export const isAdmin = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;
  return userProfile.role === 'admin';
};
