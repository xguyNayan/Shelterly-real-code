// This is a standalone script to create an admin user
// Run with: node createAdmin.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase configuration - copied directly from your config.ts
const firebaseConfig = {
  apiKey: "AIzaSyDDXE6W73LM9suz3oaSIVUxoG_Q9k6RByk",
  authDomain: "shelterly-a7db0.firebaseapp.com",
  projectId: "shelterly-a7db0",
  storageBucket: "shelterly-a7db0.firebasestorage.app",
  messagingSenderId: "926425114631",
  appId: "1:926425114631:web:e5917d8f0ff1b9007de2a2",
  measurementId: "G-JZVQT3BRY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@shelterly.in';
const ADMIN_PASSWORD = 'ShelterlywithSV';
const ADMIN_NAME = 'Shelterly Admin';

async function createAdmin() {
  try {
     ('Starting admin user creation process...');
    
    // Try to sign in first to see if user exists
    try {
       ('Checking if admin user already exists...');
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
       ('Admin user already exists in Firebase Auth');
    } catch (error) {
      // If user doesn't exist, create it
      if (error.code === 'auth/user-not-found') {
         ('Admin user does not exist. Creating new admin user...');
        await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
         ('Admin user created in Firebase Auth');
      } else if (error.code === 'auth/wrong-password') {
         ('Admin user exists but password is different');
      } else {
        console.error('Error checking admin user:', error);
        return;
      }
    }
    
    // Get the admin user ID
    const user = auth.currentUser;
    const uid = user ? user.uid : ADMIN_EMAIL.replace('@', '_at_');
    
    // Create or update the admin document in Firestore
    const adminDocRef = doc(db, 'users', uid);
    
    try {
      const docSnap = await getDoc(adminDocRef);
      
      if (docSnap.exists()) {
         ('Admin document exists in Firestore. Updating role...');
        await setDoc(adminDocRef, {
          role: 'admin',
          updatedAt: new Date(),
          onboardingCompleted: true
        }, { merge: true });
      } else {
         ('Creating new admin document in Firestore...');
        await setDoc(adminDocRef, {
          uid: uid,
          email: ADMIN_EMAIL,
          displayName: ADMIN_NAME,
          role: 'admin',
          onboardingCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
       ('Admin user setup completed successfully!');
       (`Email: ${ADMIN_EMAIL}`);
       (`Password: ${ADMIN_PASSWORD}`);
       ('You can now log in and navigate to /admin to access the admin dashboard');
      
    } catch (error) {
      console.error('Error setting admin document:', error);
    }
    
  } catch (error) {
    console.error('Error in admin creation process:', error);
  }
}

// Run the function
createAdmin();
