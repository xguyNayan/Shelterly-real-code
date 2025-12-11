import React, { useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';

interface WishlistNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'add' | 'remove';
}

const WishlistNotification: React.FC<WishlistNotificationProps> = ({ 
  isOpen, 
  onClose, 
  message,
  type
}) => {
  // Auto-close the notification after 2 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-fade-in md:top-24 md:right-8 max-w-md w-auto min-w-[200px] pointer-events-auto">
      <div className={`flex items-center p-4 rounded-lg shadow-xl ${
        type === 'add' ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'
      }`}>
        <div className={`p-2 rounded-full mr-3 ${
          type === 'add' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
        }`}>
          <FaHeart size={16} />
        </div>
        <p className={`text-sm font-medium ${
          type === 'add' ? 'text-red-800' : 'text-gray-800'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default WishlistNotification;
