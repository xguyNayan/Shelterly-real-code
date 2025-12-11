import React from 'react';
import { FiX, FiCalendar, FiCheck, FiHeart, FiCoffee, FiHome, FiSmile } from 'react-icons/fi';
import { FaRegKissWinkHeart, FaRegLaughBeam } from 'react-icons/fa';

interface VisitBookingSuccessProps {
  pgName: string;
  date: string;
  timeSlot: string;
  onClose: () => void;
}

const VisitBookingSuccess: React.FC<VisitBookingSuccessProps> = ({ 
  pgName, 
  date, 
  timeSlot, 
  onClose 
}) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      {/* Background overlay */}
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-primary-900 bg-opacity-75 backdrop-blur-sm"></div>
      </div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-[95%] max-w-md mx-auto z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary-500"></div>
        <div className="bg-white px-4 sm:px-6 pt-4 sm:pt-5 pb-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-white rounded-full p-1 hover:bg-gray-100 focus:outline-none"
            >
              <FiX className="h-5 w-5 text-primary-500" />
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 mb-4 animate-pulse">
              <FaRegKissWinkHeart className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary-800 mb-2">Woohoo! It's a Date! 🎉</h3>
            <p className="text-sm text-gray-600">
              We're <span className="text-accent font-medium">super excited</span> you're visiting <span className="font-medium">{pgName}</span>! 
              <span className="block mt-1 italic">Your future home is waiting to meet you!</span>
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-4 border border-pink-100">
            <div className="flex items-start mb-3">
              <FiCalendar className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-800">Your Exciting Visit Details</p>
                <p className="text-sm text-gray-600">
                  <span className="block font-medium">{formatDate(date)}</span>
                  <span className="block">{timeSlot}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs text-primary-600 bg-white p-2 rounded-md">
              <FiCoffee className="h-4 w-4 mr-2 text-accent" />
              <span>Pro tip: Bring your measuring tape and dream board! 💫</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-6 bg-primary-50 p-3 rounded-lg border-l-4 border-primary-300">
            <div className="flex">
              <FiSmile className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-700">Get ready for some PG magic! ✨</p>
                <p>Our fabulous team will buzz you before your visit to confirm all the deets. Keep your phone handy - we promise we're more fun than your ex! 😉</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="inline-flex justify-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-accent to-primary-500 rounded-full hover:from-accent/90 hover:to-primary-600 focus:outline-none transform transition hover:scale-105 shadow-md"
            >
              <FaRegLaughBeam className="mr-2 h-4 w-4" />
              Awesome, can't wait!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitBookingSuccess;
