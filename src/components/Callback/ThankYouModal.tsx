import React from 'react';
import { FiX, FiPhone, FiCalendar, FiCheck } from 'react-icons/fi';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  pgName: string;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose, pgName }) => {
  if (!isOpen) return null;
  
  // Array of flirty, friendly, sarcastic messages
  const messages = [
    `We're totally crushing on your interest in ${pgName}! 😍 One of our matchmakers will call you faster than you can say "dream PG"!`,
    `Well, well, well... look who's got excellent taste in PGs! 💅 We'll ring you up soon about ${pgName}, so keep your phone as ready as your moving boxes!`,
    `You + ${pgName} = A match made in housing heaven! 💘 We'll call you soon to seal the deal on this budding relationship!`,
    `Ooh la la! Someone's fallen for ${pgName}! 💋 Don't worry, we won't tell the other PGs you're looking. Expect our call soon!`,
    `Is it hot in here, or is it just the chemistry between you and ${pgName}? 🔥 We'll call to fan those flames very soon!`
  ];
  
  // Randomly select a message
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Light overlay with blur */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Subtle decorative elements - smaller for mobile */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-28 h-28 md:w-56 md:h-56 bg-teal-100/30 rounded-full blur-3xl"></div>
      
      {/* Modal with glassmorphism - smaller for mobile */}
      <div className="relative z-10 backdrop-blur-xl bg-white/60 border border-white/50 rounded-2xl shadow-lg w-full max-w-xs md:max-w-md mx-auto overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 md:top-4 right-2 md:right-4 z-20 text-gray-400 hover:text-gray-600 bg-white/80 rounded-full p-1.5 backdrop-blur-sm"
          aria-label="Close"
        >
          <FiX size={16} />
        </button>
        
        {/* Success icon - smaller for mobile */}
        <div className="pt-4 md:pt-6 flex justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 flex items-center justify-center shadow-sm">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center">
              <FiCheck className="text-white" size={16} />
            </div>
          </div>
        </div>
        
        {/* Title - smaller font for mobile */}
        <div className="px-4 md:px-6 pt-2 md:pt-4 flex justify-center">
          <h3 className="text-lg md:text-2xl font-bold text-center text-gray-800">Thanks for Your Request!</h3>
        </div>
        
        {/* Message - more compact for mobile */}
        <div className="px-4 md:px-6 pt-1 md:pt-2 text-center">
          <p className="text-xs md:text-base text-gray-600">We've received your callback request for</p>
          <p className="font-medium text-primary-800 text-sm md:text-base">{ pgName }</p>
        </div>
        
        {/* Flirty message - more compact for mobile */}
        <div className="px-4 md:px-6 py-2 md:py-4 text-center">
          <p className="text-xs md:text-sm italic text-gray-600 bg-blue-50/50 p-2 md:p-3 rounded-lg">
            { randomMessage }
          </p>
        </div>
        
        {/* Call info - more compact for mobile */}
        <div className="px-4 md:px-6 py-2 md:py-3">
          <div className="flex items-center bg-white/70 p-2 md:p-3 rounded-xl shadow-sm">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 md:mr-3">
              <FiPhone className="text-blue-500" size={14} />
            </div>
            <div>
              <p className="text-xs md:text-base font-medium">Our team will call you within 24 hours</p>
            </div>
          </div>
        </div>
        
        {/* Check status - more compact for mobile */}
        <div className="px-4 md:px-6 py-2 md:py-3">
          <div className="flex items-center bg-white/70 p-2 md:p-3 rounded-xl shadow-sm">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 md:mr-3">
              <FiCalendar className="text-blue-500" size={14} />
            </div>
            <div>
              <p className="text-xs md:text-base font-medium">Check request status in your profile</p>
            </div>
          </div>
        </div>
        
        {/* Button - more compact for mobile */}
        <div className="p-4 md:p-6">
          <button 
            onClick={onClose}
            className="w-full py-2 md:py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs md:text-base font-medium rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-md flex items-center justify-center"
          >
            Got it, I'll wait for your call! <span className="ml-1">📞</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
