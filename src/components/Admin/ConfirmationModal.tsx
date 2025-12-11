import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  // Function to handle confirmation
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FiAlertTriangle size={24} />,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle size={24} />,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'success':
        return {
          icon: <FiCheck size={24} />,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700',
        };
      case 'info':
      default:
        return {
          icon: <FiAlertTriangle size={24} />,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4 text-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${styles.iconBg} p-2 rounded-full ${styles.iconColor}`}>
                {styles.icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none ${styles.button}`}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
