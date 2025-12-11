import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  viewedPGCount: number;
  incrementViewedPGCount: () => void;
  resetViewedPGCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [viewedPGCount, setViewedPGCount] = useState<number>(0);
  
  useEffect(() => {
    // Check for saved user in localStorage on initial load
    const savedUser = localStorage.getItem('shelterlyUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check for saved viewedPGCount in localStorage
    const savedCount = localStorage.getItem('viewedPGCount');
    if (savedCount) {
      setViewedPGCount(parseInt(savedCount, 10));
    }
  }, []);
  
  // Save viewedPGCount to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewedPGCount', viewedPGCount.toString());
  }, [viewedPGCount]);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to authenticate
    // For demo purposes, we'll simulate a successful login with any valid-looking email
    if (email && email.includes('@') && password.length >= 6) {
      const newUser = {
        id: '123',
        name: email.split('@')[0],
        email
      };
      
      setUser(newUser);
      localStorage.setItem('shelterlyUser', JSON.stringify(newUser));
      resetViewedPGCount();
      return true;
    }
    return false;
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to register the user
    // For demo purposes, we'll simulate a successful signup with any valid-looking data
    if (name && email && email.includes('@') && password.length >= 6) {
      const newUser = {
        id: '123',
        name,
        email
      };
      
      setUser(newUser);
      localStorage.setItem('shelterlyUser', JSON.stringify(newUser));
      resetViewedPGCount();
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('shelterlyUser');
    resetViewedPGCount();
  };
  
  const incrementViewedPGCount = () => {
    if (!user) {
      setViewedPGCount(prev => prev + 1);
    }
  };
  
  const resetViewedPGCount = () => {
    setViewedPGCount(0);
    localStorage.removeItem('viewedPGCount');
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    viewedPGCount,
    incrementViewedPGCount,
    resetViewedPGCount
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
