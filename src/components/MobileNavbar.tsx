import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiHeart, FiSearch, FiUser, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../firebase/admin';
import ShelterSwipeButton from './ShelterSwipe/ShelterSwipeButton';
import './MobileNavbar.css';

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is admin based on userProfile
    if (userProfile) {
      const adminStatus = isAdmin(userProfile);
      setIsUserAdmin(adminStatus);
    }
  }, [userProfile]);
  
  // Check if the current path matches the link
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="mobile-navbar">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <motion.div whileTap={{ scale: 0.9 }}>
          <FiHome className="nav-icon" />
          <span className="nav-label">Home</span>
        </motion.div>
      </Link>
      
      <Link to="/pg-listing" className={`nav-item ${isActive('/pg-listing') ? 'active' : ''}`}>
        <motion.div whileTap={{ scale: 0.9 }}>
          <FiSearch className="nav-icon" />
          <span className="nav-label">Explore</span>
        </motion.div>
      </Link>
      
      {/* ShelterSwipe Button in the center */}
      <ShelterSwipeButton />
      
      <Link to="/wishlist" className={`nav-item ${isActive('/wishlist') ? 'active' : ''}`}>
        <motion.div whileTap={{ scale: 0.9 }}>
          <FiHeart className="nav-icon" />
          <span className="nav-label">Wishlist</span>
        </motion.div>
      </Link>
      
      {isUserAdmin && (
        <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.9 }}>
            <FiSettings className="nav-icon" />
            <span className="nav-label">Admin</span>
          </motion.div>
        </Link>
      )}
      
      
      <Link to={currentUser ? "/profile" : "/login"} className={`nav-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`}>
        <motion.div whileTap={{ scale: 0.9 }}>
          <FiUser className="nav-icon" />
          <span className="nav-label">{currentUser ? "Profile" : "Login"}</span>
        </motion.div>
      </Link>
    </div>
  );
};

export default MobileNavbar;
