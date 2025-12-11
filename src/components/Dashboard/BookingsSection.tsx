import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiCheck, FiX, FiDownload, FiMessageSquare } from 'react-icons/fi';

// Mock bookings data
const mockBookings = [
  {
    id: 'booking-1',
    pgName: 'Urban Nest',
    location: 'Koramangala',
    bookingDate: '15 Apr 2025',
    checkInDate: '01 May 2025',
    checkOutDate: '01 May 2026',
    status: 'confirmed',
    amount: 15000,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=1',
    roomType: 'Single Sharing'
  },
  {
    id: 'booking-2',
    pgName: 'Comfort Zone',
    location: 'Indiranagar',
    bookingDate: '10 Apr 2025',
    checkInDate: '15 Apr 2025',
    checkOutDate: '15 Apr 2026',
    status: 'active',
    amount: 12000,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=2',
    roomType: 'Double Sharing'
  },
  {
    id: 'booking-3',
    pgName: 'Serene Stay',
    location: 'HSR Layout',
    bookingDate: '05 Mar 2025',
    checkInDate: '01 Apr 2025',
    checkOutDate: '01 Apr 2026',
    status: 'completed',
    amount: 14000,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=3',
    roomType: 'Single Sharing'
  },
  {
    id: 'booking-4',
    pgName: 'Cozy Corner',
    location: 'Whitefield',
    bookingDate: '20 Feb 2025',
    checkInDate: '01 Mar 2025',
    checkOutDate: '01 Mar 2026',
    status: 'cancelled',
    amount: 13000,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=4',
    roomType: 'Triple Sharing'
  }
];

const BookingsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Filter bookings based on status
  const filteredBookings = activeFilter === 'all' 
    ? mockBookings 
    : mockBookings.filter(booking => booking.status === activeFilter);
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' };
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' };
      case 'completed':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
        
        {/* Filter tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['all', 'confirmed', 'active', 'completed', 'cancelled'].map(filter => (
            <button 
              key={filter}
              className={`px-3 py-1 rounded-md text-sm capitalize ${
                activeFilter === filter ? 'bg-white shadow-sm' : ''
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiCalendar className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">
            {activeFilter === 'all' 
              ? "You haven't made any bookings yet" 
              : `You don't have any ${activeFilter} bookings`}
          </p>
          <Link 
            to="/pg-listing" 
            className="px-6 py-3 bg-primary-500 text-white rounded-full inline-block"
          >
            Explore PGs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map(booking => {
            const statusBadge = getStatusBadge(booking.status);
            
            return (
              <div 
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 relative">
                    <img 
                      src={booking.image} 
                      alt={booking.pgName} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${statusBadge.bg} ${statusBadge.text}
                      `}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{booking.pgName}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FiMapPin size={10} className="text-primary-500" />
                          {booking.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">₹{booking.amount.toLocaleString()}/mo</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.roomType}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Booking Date</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <FiCalendar size={12} className="text-primary-500" />
                          {booking.bookingDate}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Check-in Date</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <FiCheck size={12} className="text-green-500" />
                          {booking.checkInDate}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Check-out Date</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <FiX size={12} className="text-red-500" />
                          {booking.checkOutDate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                      {booking.status === 'confirmed' && (
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-full flex items-center gap-1">
                          <FiClock size={12} />
                          Reschedule
                        </button>
                      )}
                      
                      {(booking.status === 'confirmed' || booking.status === 'active') && (
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-full flex items-center gap-1">
                          <FiX size={12} />
                          Cancel Booking
                        </button>
                      )}
                      
                      <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-full flex items-center gap-1">
                        <FiDownload size={12} />
                        Download Receipt
                      </button>
                      
                      <Link 
                        to={`/pg-details/${booking.id}`}
                        className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded-full flex items-center gap-1"
                      >
                        View Details
                      </Link>
                      
                      {booking.status === 'active' && (
                        <button className="px-3 py-1.5 text-xs bg-teal-500 text-white rounded-full flex items-center gap-1">
                          <FiMessageSquare size={12} />
                          Contact Owner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsSection;
