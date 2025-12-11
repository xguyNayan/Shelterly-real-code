import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';

interface QuirkyWhatsappQuestionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const QuirkyWhatsappQuestion: React.FC<QuirkyWhatsappQuestionProps> = ({ 
  value, 
  onChange, 
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [animateEmoji, setAnimateEmoji] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  
  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Trigger emoji animation when valid
  useEffect(() => {
    if (isValid && !animateEmoji) {
      setAnimateEmoji(true);
    }
    
    // Validate number when value changes
    validateNumber(value);
  }, [value]);
  
  const validateNumber = (number: string) => {
    if (!touched) return;
    
    if (!number || number.length === 0) {
      setValidationError('WhatsApp number is required');
      return false;
    }
    
    if (number.length !== 10) {
      setValidationError('Please enter a 10-digit mobile number');
      return false;
    }
    
    // Check if it's a valid Indian mobile number (starts with 6, 7, 8, or 9)
    if (!['6', '7', '8', '9'].includes(number.charAt(0))) {
      setValidationError('Please enter a valid Indian mobile number (starting with 6, 7, 8, or 9)');
      return false;
    }
    
    // Check for repeated digits (more than 7 repeated digits is likely fake)
    const repeatedDigitsRegex = /(\d)\1{7,}/;
    if (repeatedDigitsRegex.test(number)) {
      setValidationError('This number appears to be invalid (too many repeated digits)');
      return false;
    }
    
    // All checks passed
    setValidationError('');
    return true;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const input = e.target.value.replace(/\D/g, '');
    onChange(input);
    setTouched(true);
  };
  
  // Add a paste handler to properly handle pasting numbers
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.replace(/\D/g, '');
    onChange(cleanedText);
    setTouched(true);
  };
  
  const isValid = value.length === 10 && 
                  ['6', '7', '8', '9'].includes(value.charAt(0)) && 
                  !/(\d)\1{7,}/.test(value);
  
  // Animation variants
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      <div className="relative z-10 space-y-8">
        {/* Premium header with fun elements */}
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
                📱
              </motion.span>
              Stay connected!
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
            Share your WhatsApp number so we can send you updates about your PG! <span className="text-red-500 font-medium">*</span>
          </motion.p>
        </motion.div>
        
        {/* Premium input container */}
        <motion.div 
          className="max-w-md mx-auto mb-3 sm:mb-4"
          variants={itemVariants}
        >
          <div className="relative">
            <div className="flex items-center">
              <div className="bg-primary-50 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="tel"
                value={value}
                onChange={handleChange}
                onPaste={handlePaste}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  setTouched(true);
                  validateNumber(value);
                }}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 shadow-sm ${
                  validationError && touched ? 'border-red-400' : 
                  isFocused ? 'border-primary-400 shadow-sm' : 'border-gray-200'
                }`}
                placeholder="Your WhatsApp number (required)"
                maxLength={10}
                inputMode="numeric"
                required
                aria-required="true"
              />
            </div>
            
            {/* Validation message with animations */}
            <div className="mt-2 text-sm text-center min-h-[24px]">
              {touched && (
                <motion.div 
                  className={`${
                    isValid ? 'text-green-600' : 'text-red-500'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  key={`${value.length}-${isValid}-${validationError}`}
                >
                  {isValid 
                    ? (
                      <span className="flex items-center justify-center">
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="mr-1"
                        >
                          ✅
                        </motion.span> 
                        Perfect! Your number looks good!
                      </span>
                    ) 
                    : (
                      <span className="flex items-center justify-center">
                        <motion.span 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="mr-1"
                        >
                          <FiAlertCircle className="text-red-500" />
                        </motion.span>
                        {validationError || `Please enter a 10-digit number (${10 - value.length} more digits needed)`}
                      </span>
                    )
                  }
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Premium navigation buttons */}
        <motion.div 
          className="pt-2 sm:pt-4 flex justify-between"
          variants={itemVariants}
        >
          <motion.button
            onClick={onBack}
            className="group relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium flex items-center"
            whileHover={{ x: -3, borderColor: "#9ca3af" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="relative z-10 flex items-center">
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ x: [0, -3, 0] }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, repeatDelay: 1 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </motion.svg>
              Back
            </span>
          </motion.button>
          
          <motion.button
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
            className={`group relative overflow-hidden px-5 sm:px-8 py-2 sm:py-3 rounded-full text-white text-xs sm:text-base font-medium flex items-center justify-center min-w-[100px] sm:min-w-[120px] ${isValid && !isSubmitting
                ? 'bg-gradient-to-r from-primary-500 to-teal-500 shadow-md' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            whileHover={isValid && !isSubmitting ? { y: -2, boxShadow: "0 5px 15px -3px rgba(8, 145, 178, 0.4)" } : {}}
            whileTap={isValid && !isSubmitting ? { y: -1 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Button background animation */}
            {isValid && !isSubmitting && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
            
            <span className="relative z-10 flex items-center">
              {isSubmitting ? (
                <>
                  <motion.svg 
                    className="-ml-1 mr-2 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Processing...
                  </motion.span>
                </>
              ) : (
                <>
                  Submit
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 ml-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={isValid ? { x: [0, 5, 0] } : {}}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, repeatDelay: 1 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuirkyWhatsappQuestion;
