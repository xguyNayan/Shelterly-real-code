import React from 'react';
import { motion } from 'framer-motion';

type ReferralOption = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

interface QuirkyReferralQuestionProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuirkyReferralQuestion: React.FC<QuirkyReferralQuestionProps> = ({ 
  value, 
  onChange, 
  onNext,
  onBack
}) => {
  const referralOptions: ReferralOption[] = [
    { id: 'instagram', label: 'Instagram', icon: '📸', description: 'Those aesthetic Reels got you, huh?' },
    { id: 'chatgpt', label: 'ChatGPT', icon: '🤖', description: 'AI knows what you need!' },
    { id: 'friend', label: 'Friend', icon: '👂', description: 'Word of mouth is still the best' },
    { id: 'google', label: 'Google Search', icon: '🔍', description: 'Detective skills on point' },
    { id: 'facebook', label: 'Facebook', icon: '👥', description: 'Old school but gold school' },
    { id: 'other', label: 'Other', icon: '✨', description: 'The universe works in mysterious ways' }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      className="py-6 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center mb-4 sm:mb-6"
        variants={itemVariants}
      >
        <div className="inline-block relative mb-2">
          <motion.span 
            className="absolute -top-4 -left-4 text-2xl"
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            ✨
          </motion.span>
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500 mb-2 flex items-center justify-center">
            <motion.span 
              className="inline-block mr-3 text-2xl"
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              🔍
            </motion.span>
            How did you find us?
          </h2>
          <motion.span 
            className="absolute -top-3 -right-4 text-2xl"
            animate={{ 
              y: [0, -5, 0],
              x: [0, 3, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
          >
            ✨
          </motion.span>
        </div>
        <motion.p 
          className="text-gray-600 max-w-md mx-auto text-xs sm:text-sm bg-white/90 py-1.5 sm:py-2 px-3 sm:px-5 rounded-full shadow-sm"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          We're curious how you discovered Shelterly! Help us connect with more awesome people like you!
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-xl mx-auto mb-3 sm:mb-4"
        variants={itemVariants}
      >
        {referralOptions.map((option) => (
          <motion.div 
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all duration-300 cursor-pointer relative overflow-hidden ${
              value === option.id 
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-teal-50 shadow-sm' 
                : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex items-center relative z-10">
              <div className="text-xl sm:text-2xl mr-2 sm:mr-3">
                {option.icon}
              </div>
              <div>
                <div className={`font-medium text-sm sm:text-base ${
                  value === option.id ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {option.label}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">{option.description}</div>
              </div>
            </div>
            
            {/* Selection indicator */}
            {value === option.id && (
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-primary-500 text-white p-0.5 sm:p-1 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="pt-2 sm:pt-4 flex justify-between space-x-4"
        variants={itemVariants}
      >
        <motion.button
          onClick={onBack}
          className="group relative overflow-hidden px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
          whileHover={{ x: -3, borderColor: "#9ca3af" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <span className="relative z-10 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </span>
        </motion.button>
        
        <motion.button
          onClick={onNext}
          disabled={!value}
          className={`group relative overflow-hidden px-6 sm:px-8 py-2 sm:py-3 rounded-full text-white text-xs sm:text-base font-medium ${
            value
              ? 'bg-gradient-to-r from-primary-500 to-teal-500 shadow-md' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          whileHover={value ? { y: -2, boxShadow: "0 5px 15px -3px rgba(8, 145, 178, 0.4)" } : {}}
          whileTap={value ? { y: -1 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* Button background animation */}
          {value && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
          
          <span className="relative z-10 flex items-center">
            Next
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={value ? { x: [0, 3, 0] } : {}}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, repeatDelay: 1 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </motion.svg>
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default QuirkyReferralQuestion;
