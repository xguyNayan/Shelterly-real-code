import React, { useState, useEffect } from 'react';
import { FiCalendar, FiCheck, FiX, FiClock, FiRefreshCw, FiFilter, FiMapPin, FiInfo, FiEdit, FiUsers, FiHome, FiChevronDown } from 'react-icons/fi';
import { VisitRequest, getAllVisitRequests, updateVisitRequestStatus, rescheduleVisit } from '../../firebase/visitService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDistanceToNow } from 'date-fns';

// Helper function to format visit dates regardless of their type
const formatVisitDate = (date: any): string => {
  if (!date) return 'No date specified';
  
  // Handle Firestore Timestamp objects
  if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString();
  }
  
  // Handle Date objects
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  
  // Handle string dates
  if (typeof date === 'string') {
    // Try to parse the string as a date
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return date; // Return as is if parsing fails
    }
  }
  
  // Fallback
  return String(date);
};

// Helper function to check if a request is from an anonymous user
const isAnonymousRequest = (request: VisitRequest): boolean => {
  return !request.userId || request.userId === '';
};

const VisitRequests: React.FC = () => {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'resolved' | 'cancelled'>('all');
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState('');
  const [newVisitTime, setNewVisitTime] = useState('');

  useEffect(() => {
    fetchVisitRequests();
  }, []);

  const fetchVisitRequests = async () => {
    try {
      setLoading(true);
      const visitData = await getAllVisitRequests();
      setRequests(visitData);
      setError('');
    } catch (err: any) {
      setError('Failed to load visit requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: VisitRequest['status'], newMessage?: string) => {
    try {
      setUpdatingId(id);
      await updateVisitRequestStatus(id, status);
      
      // Get the request that's being updated
      const request = requests.find(req => req.id === id);
      
      if (request && newMessage) {
        // Update the message in Firestore
        const docRef = doc(db, 'visitRequests', id);
        await updateDoc(docRef, { 
          message: newMessage,
          updatedAt: Timestamp.now() 
        });
        
        // Update local state with new message
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status, message: newMessage, updatedAt: req.updatedAt } : req
        ));
        
        // Update selected request
        setSelectedRequest(newMessage 
          ? {...selectedRequest, status, message: newMessage}
          : {...selectedRequest, status}
        );
      } else {
        // Just update status in local state
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status, updatedAt: req.updatedAt } : req
        ));
        
        // Update selected request
        setSelectedRequest({...selectedRequest, status});
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };
  
  // Handle rescheduling a visit
  const handleRescheduleVisit = async () => {
    if (!selectedRequest || !newVisitDate || !newVisitTime) return;
    
    try {
      setUpdatingId(selectedRequest.id!);
      
      // Create a new message with the updated visit details
      const newMessage = `Visit rescheduled from ${selectedRequest.visitDate} at ${selectedRequest.visitTime} to ${newVisitDate} at ${newVisitTime}. ${selectedRequest.specialRequirements !== 'None' ? `Special requirements: ${selectedRequest.specialRequirements}` : ''}`;
      
      // Use the dedicated reschedule function
      await rescheduleVisit(selectedRequest.id!, newVisitDate, newVisitTime, newMessage);
      
      // Update local state
      const updatedRequest = {
        ...selectedRequest,
        status: 'contacted' as VisitRequest['status'],
        visitDate: newVisitDate,
        visitTime: newVisitTime,
        message: newMessage,
        updatedAt: Timestamp.now()
      };
      
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      ));
      
      // Update selected request
      setSelectedRequest(updatedRequest);
      
      // Reset form
      setShowRescheduleForm(false);
      setNewVisitDate('');
      setNewVisitTime('');
    } catch (err) {
      console.error('Error rescheduling visit:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  // Define visit-specific status types
  type VisitStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  
  // Time slots for rescheduling
  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
  ];
  
  // Map database statuses to visit-specific display statuses
  const getVisitStatusFromDbStatus = (status: VisitRequest['status']): VisitStatus => {
    switch (status) {
      case 'pending':
        return 'scheduled';
      case 'contacted':
        return 'confirmed';
      case 'resolved':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'scheduled'; // Default fallback
    }
  };
  
  // Get the appropriate status badge with visit-specific terminology
  const getStatusBadge = (status: VisitRequest['status']) => {
    const visitStatus = getVisitStatusFromDbStatus(status);
    
    switch (visitStatus as VisitStatus) {
      case 'scheduled':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
          <FiCalendar className="mr-1 h-3 w-3" /> Scheduled
        </span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
          <FiCheck className="mr-1 h-3 w-3" /> Confirmed
        </span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
          <FiCheck className="mr-1 h-3 w-3" /> Completed
        </span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
          <FiX className="mr-1 h-3 w-3" /> Cancelled
        </span>;
      case 'rescheduled':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
          <FiClock className="mr-1 h-3 w-3" /> Rescheduled
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Visit Requests</h1>
        <button 
          onClick={fetchVisitRequests}
          className="flex items-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter controls */}
      <div className="flex items-center mb-4 overflow-x-auto pb-2">
        <div className="flex items-center mr-4">
          <FiFilter className="mr-2 text-gray-500" />
          <span className="text-sm text-gray-500">Filter:</span>
        </div>
        <button
          onClick={() => setFilter('all')}
          className={`mr-2 px-3 py-1 rounded-full text-sm ${
            filter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`mr-2 px-3 py-1 rounded-full text-sm ${
            filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiCalendar className="inline mr-1 h-3 w-3" />
          Scheduled
        </button>
        <button
          onClick={() => setFilter('contacted')}
          className={`mr-2 px-3 py-1 rounded-full text-sm ${
            filter === 'contacted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiCheck className="inline mr-1 h-3 w-3" />
          Confirmed
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`mr-2 px-3 py-1 rounded-full text-sm ${
            filter === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiCheck className="inline mr-1 h-3 w-3" />
          Completed
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`mr-2 px-3 py-1 rounded-full text-sm ${
            filter === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FiX className="inline mr-1 h-3 w-3" />
          Cancelled
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No visit requests found</h3>
          <p className="text-gray-500">
            {filter !== 'all' 
              ? `There are no ${filter} visit requests at the moment.` 
              : 'There are no visit requests at the moment.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedRequest(request)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-gray-900">
                            {request.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.userEmail}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {request.userWhatsappNumber || request.userPhone || 'No phone provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.pgName}</div>
                      <div className="text-xs text-gray-500">ID: {request.pgId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiCalendar className="mr-1 text-accent" /> {formatVisitDate(request.visitDate)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <FiClock className="inline mr-1 text-accent" /> {request.visitTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.createdAt && request.createdAt.toDate ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true }) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(request.id!, 'contacted');
                            }}
                            disabled={updatingId === request.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Confirm Visit"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                        )}
                        {(request.status === 'pending' || request.status === 'contacted') && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(request.id!, 'resolved');
                              }}
                              disabled={updatingId === request.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Mark Visit as Completed"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request);
                                setShowRescheduleForm(true);
                              }}
                              disabled={updatingId === request.id}
                              className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                              title="Reschedule Visit"
                            >
                              <FiEdit className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {request.status !== 'cancelled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(request.id!, 'cancelled');
                            }}
                            disabled={updatingId === request.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Cancel Visit"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visit Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setSelectedRequest(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Modal Header with colored top bar */}
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-primary-500 to-accent"></div>
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-accent/20 mr-3">
                      <FiCalendar className="h-5 w-5 text-accent" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                      Visit Request Details
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="rounded-full p-1 hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <FiX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
                {/* Status Card */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4 border-l-4 border-accent shadow-sm">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Current Status</h4>
                      <p className="text-xs text-gray-500">Last updated: {selectedRequest.updatedAt && selectedRequest.updatedAt.toDate ? formatDistanceToNow(selectedRequest.updatedAt.toDate(), { addSuffix: true }) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <FiUsers className="mr-2 text-primary-500" /> User Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold mr-2">
                          {selectedRequest.userName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedRequest.userName}</p>
                          <p className="text-xs text-gray-600">{selectedRequest.userEmail}</p>
                        </div>
                      </div>
                      {(selectedRequest.userWhatsappNumber || selectedRequest.userPhone) && (
                        <div className="flex items-center text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedRequest.userWhatsappNumber || selectedRequest.userPhone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Property Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <FiHome className="mr-2 text-primary-500" /> Property
                    </h4>
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <FiMapPin className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedRequest.pgName}</p>
                        <p className="text-xs text-gray-500">ID: {selectedRequest.pgId}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Visit Details Card */}
                <div className="mt-6 bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                    <FiCalendar className="mr-2 text-primary-500" /> Visit Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <FiCalendar className="mr-2 text-accent" /> {selectedRequest.visitDate}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <FiClock className="mr-2 text-accent" /> {selectedRequest.visitTime}
                      </p>
                    </div>
                  </div>
                  
                  {selectedRequest.specialRequirements !== 'None' && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Special Requirements</p>
                      <p className="text-sm text-gray-700 flex items-start">
                        <FiInfo className="mr-2 text-accent mt-0.5 flex-shrink-0" /> 
                        <span>{selectedRequest.specialRequirements}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1 h-3 w-3" />
                        <span>Created: {selectedRequest.createdAt && selectedRequest.createdAt.toDate ? formatDistanceToNow(selectedRequest.createdAt.toDate(), { addSuffix: true }) : 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <FiRefreshCw className="mr-1 h-3 w-3" />
                        <span>Updated: {selectedRequest.updatedAt && selectedRequest.updatedAt.toDate ? formatDistanceToNow(selectedRequest.updatedAt.toDate(), { addSuffix: true }) : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Reschedule Form */}
              {showRescheduleForm ? (
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                  <div className="bg-accent/5 p-4 rounded-lg border border-accent/20 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <FiEdit className="mr-2 text-accent" /> Reschedule Visit
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="new-date" className="block text-xs font-medium text-gray-700 mb-1">New Date</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="new-date"
                            value={newVisitDate}
                            onChange={(e) => setNewVisitDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="new-time" className="block text-xs font-medium text-gray-700 mb-1">New Time</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiClock className="h-4 w-4 text-gray-400" />
                          </div>
                          <select
                            id="new-time"
                            value={newVisitTime}
                            onChange={(e) => setNewVisitTime(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-accent focus:border-accent appearance-none"
                            required
                          >
                            <option value="">Select a time slot</option>
                            {timeSlots.map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowRescheduleForm(false)}
                        className="mr-3 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                      >
                        <FiX className="mr-1.5 h-4 w-4" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleRescheduleVisit}
                        disabled={!newVisitDate || !newVisitTime || updatingId === selectedRequest.id}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingId === selectedRequest.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiCalendar className="mr-1.5 h-4 w-4" /> Confirm Reschedule
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Close
                  </button>
                  
                  {selectedRequest.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedRequest.id!, 'cancelled')}
                      disabled={updatingId === selectedRequest.id}
                      className="mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingId === selectedRequest.id ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FiX className="mr-1.5 h-4 w-4" />
                      )}
                      Cancel Visit
                    </button>
                  )}
                  
                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'contacted') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowRescheduleForm(true)}
                        disabled={updatingId === selectedRequest.id}
                        className="mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiEdit className="mr-1.5 h-4 w-4" /> Reschedule
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedRequest.id!, 'resolved')}
                        disabled={updatingId === selectedRequest.id}
                        className="mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingId === selectedRequest.id ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FiCheck className="mr-1.5 h-4 w-4" />
                        )}
                        Mark Completed
                      </button>
                    </>
                  )}
                  
                  {selectedRequest.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedRequest.id!, 'contacted')}
                      disabled={updatingId === selectedRequest.id}
                      className="mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingId === selectedRequest.id ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FiCheck className="mr-1.5 h-4 w-4" />
                      )}
                      Confirm Visit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitRequests;
