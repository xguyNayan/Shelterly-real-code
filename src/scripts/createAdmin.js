// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase configuration
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

/**
 * Creates an admin user if it doesn't already exist
 */
const createAdminUser = async () => {
  try {
     ('Starting admin user creation process...');
    
    // Check if user exists in auth
    let adminUser;
    try {
       ('Attempting to create admin user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUser = userCredential.user;
      
      // Update display name
      await updateProfile(adminUser, {
        displayName: ADMIN_NAME
      });
      
       ('Admin user created in Firebase Auth');
    } catch (error) {
      // If error is because user already exists, we can continue
      if (error.code === 'auth/email-already-in-use') {
         ('Admin user already exists in Firebase Auth');
      } else {
        throw error;
      }
    }
    
    // Create admin document in Firestore
    const adminUid = adminUser?.uid || ADMIN_EMAIL.replace('@', '_at_');
     (`Using admin UID: ${adminUid}`);
    
    // Check if admin document exists in Firestore
    const adminDocRef = doc(db, 'users', adminUid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
       ('Creating admin user document in Firestore...');
      // Create admin document in Firestore
      const adminData = {
        uid: adminUid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_NAME,
        role: 'admin',
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(adminDocRef, adminData);
       ('Admin user created in Firestore');
    } else {
       ('Updating existing user document to admin role...');
      // Update role to admin if not already
      const userData = adminDoc.data();
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
    
     ('Admin user creation process completed successfully!');
     ('You can now log in with:');
     (`Email: ${ADMIN_EMAIL}`);
     (`Password: ${ADMIN_PASSWORD}`);
     ('Navigate to /admin to access the admin dashboard');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run the script
createAdminUser();
