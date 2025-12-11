import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile, getUserProfile, createUserProfile } from '../firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  needsOnboarding: false,
  refreshUserProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (user: User) => {
    try {
      let profile = await getUserProfile(user.uid);
      
      // If profile doesn't exist, create one
      if (!profile) {
        profile = await createUserProfile(user);
        setNeedsOnboarding(true);
      } else {
        // Check if onboarding is completed
        setNeedsOnboarding(!profile.onboardingCompleted);
        console.log('Onboarding status check:', profile.uid, 'onboardingCompleted:', profile.onboardingCompleted);
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If we encounter errors, we'll set a default profile to prevent app from breaking
      const defaultProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        onboardingCompleted: false,
        role: 'tenant', // Default role
        createdAt: null,
        updatedAt: null
      };
      setUserProfile(defaultProfile);
      setNeedsOnboarding(true); // Default to showing onboarding
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile data
  const refreshUserProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setNeedsOnboarding(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    needsOnboarding,
    refreshUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
