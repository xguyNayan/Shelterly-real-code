import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiMessageSquare, FiChevronDown, FiHeart, FiSmile } from 'react-icons/fi';
import { FaRegKissWinkHeart, FaRegLaughBeam, FaMapMarkerAlt } from 'react-icons/fa';
import { addVisitRequest } from '../../firebase/visitService';
import { useAuth } from '../../contexts/AuthContext';
import VisitBookingSuccess from './VisitBookingSuccess';

interface BookVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  pgId: string;
  pgName: string;
  onSuccess: () => void;
}

const BookVisitModal: React.FC<BookVisitModalProps> = ({ 
  isOpen, 
  onClose, 
  pgId, 
  pgName, 
  onSuccess 
}) => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get tomorrow's date as the default minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get date 30 days from now as the maximum date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM',
    '9:00 PM - 10:00 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot) {
      setError('Please select both date and time for your visit');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to book a visit');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format the message with all the details
      const message = `Book a visit request for ${pgName}
Date: ${date}
Time: ${timeSlot}
${requirements ? `Special Requirements: ${requirements}` : ''}`;
      
      // Add visit request to Firestore using the new visitService
      await addVisitRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userEmail: currentUser.email || '',
        userPhone: currentUser.phoneNumber || '',
        userWhatsappNumber: currentUser.phoneNumber || '',
        pgId,
        pgName,
        status: 'pending',
        visitDate: date,
        visitTime: timeSlot,
        specialRequirements: requirements || 'None',
        message: `Visit requested for ${date} at ${timeSlot}${requirements ? `. Additional requirements: ${requirements}` : ''}`
      });

      // Show success message instead of closing immediately
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting visit request:', err);
      setError('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <VisitBookingSuccess 
        pgName={pgName}
        date={date}
        timeSlot={timeSlot}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      {/* Background overlay */}
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-primary-900 bg-opacity-75 backdrop-blur-sm"></div>
      </div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-[95%] max-w-md mx-auto z-10 max-h-[90vh] overflow-y-auto border border-pink-100">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-primary-500 to-accent"></div>
        <div className="absolute top-0 right-0 w-12 h-12 bg-pink-50 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-50 rounded-tr-full opacity-50"></div>
        <div className="bg-white bg-opacity-95 px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bTAgLTEyYzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNG0tMTIgLTEyYzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNG0tMTIgMTJjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bTAgMTJjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bS0xMiAtMTJjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
          <div className="relative">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-primary-800 pr-2 flex items-center">
                <FaMapMarkerAlt className="text-accent mr-2" />
                Let's Plan Your Visit! <span className="text-accent ml-1">✨</span>
              </h3>
              <p className="text-xs text-primary-500 italic">Your future home at {pgName} can't wait to meet you!</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white rounded-full p-1 hover:bg-gray-100 focus:outline-none flex-shrink-0"
            >
              <FiX className="h-5 w-5 text-primary-500" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              {/* Date selection */}
              <div>
                <label htmlFor="visit-date" className="block text-sm font-medium text-primary-700 mb-1 flex items-center">
                  <FiCalendar className="mr-2 text-accent" />
                  Pick a Day<FiHeart className="ml-1 h-3 w-3 text-pink-400" />
                </label>
                <input
                  type="date"
                  id="visit-date"
                  min={minDate}
                  max={maxDateStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                />
                <p className="mt-1 text-xs text-gray-500 italic">The sooner the better - your dream PG is getting impatient! 😉</p>
              </div>
              
              {/* Time slot selection */}
              <div>
                <label htmlFor="visit-time" className="block text-sm font-medium text-primary-700 mb-1 flex items-center">
                  <FiClock className="mr-2 text-accent" />
                  What Time Works for You? <span className="text-xs ml-1">⏰</span>
                </label>
                <div className="relative">
                  <select
                    id="visit-time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base appearance-none pr-8"
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary-500">
                    <FiChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Special requirements */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-primary-700 mb-1 flex items-center">
                  <FiMessageSquare className="mr-2 text-accent" />
                  Any Special Wishes? <FiSmile className="ml-1 h-3 w-3 text-yellow-400" />
                </label>
                <textarea
                  id="requirements"
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Tell us your needs! Need a unicorn? Extra pillows? We're all ears..."
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 sm:mr-3 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-full hover:bg-primary-50 focus:outline-none transition-all hover:scale-105"
              >
                <FiX className="mr-1 h-3 w-3" />
                Not Today
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-accent to-primary-500 rounded-full hover:from-accent/90 hover:to-primary-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse mr-1">✨</span> Making Magic...
                  </>
                ) : (
                  <>
                    <FiHeart className="mr-1.5 h-3 w-3" /> Let's Do This!
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookVisitModal;
