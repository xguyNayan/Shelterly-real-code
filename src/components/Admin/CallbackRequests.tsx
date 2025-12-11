import React, { useState, useEffect } from 'react';
import { FiPhone, FiCheck, FiX, FiClock, FiRefreshCw, FiFilter, FiCalendar } from 'react-icons/fi';
import { CallbackRequest, getAllCallbackRequests, updateCallbackRequestStatus } from '../../firebase/callbackService';
import { getUserProfile, UserProfile } from '../../firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedCallbackRequest extends CallbackRequest {
  userWhatsappNumber?: string;
}

const CallbackRequests: React.FC = () => {
  const [requests, setRequests] = useState<EnhancedCallbackRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'resolved' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const callbackData = await getAllCallbackRequests();
      
      // Fetch user details for each callback request
      const enhancedRequests = await Promise.all(
        callbackData.map(async (request) => {
          try {
            // Get user profile to access WhatsApp number
            const userProfile = await getUserProfile(request.userId);
            return {
              ...request,
              userWhatsappNumber: userProfile?.whatsappNumber || null
            };
          } catch (error) {
            console.error(`Error fetching user details for ${request.userId}:`, error);
            return request; // Return original request if user details fetch fails
          }
        })
      );
      
      setRequests(enhancedRequests);
      setError('');
    } catch (err: any) {
      setError('Failed to load callback requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: CallbackRequest['status']) => {
    try {
      setUpdatingId(id);
      await updateCallbackRequestStatus(id, status);
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status, updatedAt: req.updatedAt } : req
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  const getStatusBadge = (status: CallbackRequest['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'contacted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Contacted</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Resolved</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Callback Requests</h1>
        <button 
          onClick={fetchRequests}
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
          <span className="text-sm text-gray-600">Filter:</span>
        </div>
        <div className="flex space-x-2">
          {(['all', 'pending', 'contacted', 'resolved', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === status 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' ? '' : ` (${requests.filter(r => r.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPhone className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No callback requests found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'There are no callback requests yet.' 
              : `There are no ${filter} callback requests.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PG
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                {filteredRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {request.userName ? request.userName.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
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
                      {request.requestType === 'visit' ? (
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium flex items-center">
                          <FiCalendar className="mr-1" /> Visit
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium flex items-center">
                          <FiPhone className="mr-1" /> Callback
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(request.id!, 'contacted')}
                            disabled={updatingId === request.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            <FiClock className="w-5 h-5" title="Mark as Contacted" />
                          </button>
                        )}
                        {(request.status === 'pending' || request.status === 'contacted') && (
                          <button
                            onClick={() => handleUpdateStatus(request.id!, 'resolved')}
                            disabled={updatingId === request.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <FiCheck className="w-5 h-5" title="Mark as Resolved" />
                          </button>
                        )}
                        {request.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(request.id!, 'cancelled')}
                            disabled={updatingId === request.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <FiX className="w-5 h-5" title="Cancel Request" />
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
    </div>
  );
};

export default CallbackRequests;
