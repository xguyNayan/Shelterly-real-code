import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiX, FiClock, FiEye, FiSearch, FiHeart, FiCalendar } from 'react-icons/fi';

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface SessionData {
  id: string;
  sessionId: string;
  startTime: any;
  lastActive: any;
  sessionDuration?: number; // Total time spent in seconds
  browser: string;
  device: string;
  screenSize: string;
  referrer: string;
  pgViewed: Array<{
    pgId: string;
    pgName: string;
    viewedAt: any;
  }>;
  pgDetailsTimeSpent: {
    [pgId: string]: number;
  };
  searchQueries: Array<{
    query: string;
    isNearMe: boolean;
    timestamp: any;
  }>;
  shelterSwipeInteractions: {
    total: number;
    left: number;
    right: number;
    pgIds: Array<{
      pgId: string;
      direction: 'left' | 'right';
      timestamp: any;
    }>;
  };
}

interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  createdAt: any;
  lastActive: any;
  isAnonymous?: boolean;
}

const UserActivityModal: React.FC<UserActivityModalProps> = ({ isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'pgs' | 'searches' | 'swipes'>('overview');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pgNames, setPgNames] = useState<{[pgId: string]: string}>({});

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
      fetchUserSessions();
    }
  }, [isOpen, userId]);

  // Fetch PG names for all PG IDs in swipe history
  useEffect(() => {
    if (sessions.length > 0 && activeTab === 'swipes') {
      fetchPgNames();
    }
  }, [sessions, activeTab]);

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() } as UserData);
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    }
  };

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      const sessionsRef = collection(db, 'users', userId, 'analytics');
      const q = query(sessionsRef, orderBy('startTime', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      
      const sessionData: SessionData[] = [];
      querySnapshot.forEach((doc) => {
        sessionData.push({ id: doc.id, ...doc.data() } as SessionData);
      });
      
      setSessions(sessionData);
    } catch (err) {
      console.error('Error fetching user sessions:', err);
      setError('Failed to load user sessions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch PG names for all PG IDs in swipe history
  const fetchPgNames = async () => {
    try {
      // Collect all unique PG IDs from swipe history
      const pgIds = new Set<string>();
      sessions.forEach(session => {
        if (session.shelterSwipeInteractions?.pgIds) {
          session.shelterSwipeInteractions.pgIds.forEach(swipe => {
            pgIds.add(swipe.pgId);
          });
        }
      });

      // Fetch PG data for each ID
      const pgNamesMap: {[pgId: string]: string} = {};
      await Promise.all(Array.from(pgIds).map(async (pgId) => {
        try {
          const pgRef = doc(db, 'pgs', pgId);
          const pgDoc = await getDoc(pgRef);
          if (pgDoc.exists()) {
            const pgData = pgDoc.data();
            pgNamesMap[pgId] = pgData.name || 'Unnamed PG';
          } else {
            pgNamesMap[pgId] = 'PG Not Found';
          }
        } catch (err) {
          console.error(`Error fetching PG data for ${pgId}:`, err);
          pgNamesMap[pgId] = 'Error Loading PG';
        }
      }));

      setPgNames(pgNamesMap);
    } catch (err) {
      console.error('Error fetching PG names:', err);
    }
  };

  // Calculate summary statistics
  const totalSessions = sessions.length;
  const totalPGViews = sessions.reduce((sum, session) => sum + (session.pgViewed?.length || 0), 0);
  const totalSearches = sessions.reduce((sum, session) => sum + (session.searchQueries?.length || 0), 0);
  const totalSwipes = sessions.reduce((sum, session) => sum + (session.shelterSwipeInteractions?.total || 0), 0);
  
  // Get most viewed PGs
  const pgViewsMap = new Map<string, { id: string, name: string, views: number }>();
  sessions.forEach(session => {
    if (session.pgViewed) {
      session.pgViewed.forEach(pg => {
        if (pgViewsMap.has(pg.pgId)) {
          const current = pgViewsMap.get(pg.pgId)!;
          pgViewsMap.set(pg.pgId, { ...current, views: current.views + 1 });
        } else {
          pgViewsMap.set(pg.pgId, { id: pg.pgId, name: pg.pgName, views: 1 });
        }
      });
    }
  });
  
  const mostViewedPGs = Array.from(pgViewsMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Format time in hours, minutes and seconds
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}h ${mins}m ${secs}s`;
    }
  };

  // Get most common search queries
  const searchQueryMap = new Map<string, number>();
  sessions.forEach(session => {
    if (session.searchQueries) {
      session.searchQueries.forEach(query => {
        const queryText = query.query.toLowerCase();
        if (searchQueryMap.has(queryText)) {
          searchQueryMap.set(queryText, searchQueryMap.get(queryText)! + 1);
        } else {
          searchQueryMap.set(queryText, 1);
        }
      });
    }
  });
  
  const topSearchQueries = Array.from(searchQueryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([query, count]) => ({ query, count }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity" onClick={onClose}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Modal positioning spacer */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full relative z-[9999]"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Activity: {userData?.displayName || userData?.email || userId}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xl">
                      {userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{userData?.displayName || 'Anonymous User'}</p>
                      <p className="text-sm text-gray-500">{userData?.email || 'No Email'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        User ID: {userId.substring(0, 12)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined: {userData?.createdAt?.toDate ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`mr-8 py-2 ${
                        activeTab === 'overview'
                          ? 'border-b-2 border-primary-500 text-primary-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className={`mr-8 py-2 ${
                        activeTab === 'sessions'
                          ? 'border-b-2 border-primary-500 text-primary-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Sessions
                    </button>
                    <button
                      onClick={() => setActiveTab('pgs')}
                      className={`mr-8 py-2 ${
                        activeTab === 'pgs'
                          ? 'border-b-2 border-primary-500 text-primary-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      PG Views
                    </button>
                    <button
                      onClick={() => setActiveTab('searches')}
                      className={`mr-8 py-2 ${
                        activeTab === 'searches'
                          ? 'border-b-2 border-primary-500 text-primary-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Searches
                    </button>
                    <button
                      onClick={() => setActiveTab('swipes')}
                      className={`mr-8 py-2 ${
                        activeTab === 'swipes'
                          ? 'border-b-2 border-primary-500 text-primary-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Swipes
                    </button>
                  </nav>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <FiClock size={20} />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500">Total Sessions</p>
                                <p className="text-lg font-semibold text-gray-800">{totalSessions}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                                <FiClock size={20} />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500">Total Time Spent</p>
                                <p className="text-lg font-semibold text-gray-800">
                                  {formatTime(sessions.reduce((total, session) => total + (session.sessionDuration || 0), 0))}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-green-100 text-green-600">
                                <FiEye size={20} />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500">PG Views</p>
                                <p className="text-lg font-semibold text-gray-800">{totalPGViews}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                <FiSearch size={20} />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500">Searches</p>
                                <p className="text-lg font-semibold text-gray-800">{totalSearches}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                                <FiHeart size={20} />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs font-medium text-gray-500">Swipes</p>
                                <p className="text-lg font-semibold text-gray-800">{totalSwipes}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Most Viewed PGs</h4>
                            {mostViewedPGs.length > 0 ? (
                              <ul className="space-y-2">
                                {mostViewedPGs.map((pg) => (
                                  <li key={pg.id} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 truncate max-w-[70%]">{pg.name}</span>
                                    <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      {pg.views} views
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No PG views recorded</p>
                            )}
                          </div>

                          <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Search Queries</h4>
                            {topSearchQueries.length > 0 ? (
                              <ul className="space-y-2">
                                {topSearchQueries.map((query, index) => (
                                  <li key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 truncate max-w-[70%]">"{query.query}"</span>
                                    <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                      {query.count} times
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">No search queries recorded</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sessions Tab */}
                    {activeTab === 'sessions' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Session ID
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Device
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Time
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Activity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map((session) => {
                              const startTime = session.startTime ? new Date(session.startTime) : null;
                              const lastActive = session.lastActive ? new Date(session.lastActive) : null;
                              // Use the stored sessionDuration if available, otherwise calculate it
                              const duration = session.sessionDuration || (startTime && lastActive 
                                ? Math.floor((lastActive.getTime() - startTime.getTime()) / 1000) 
                                : 0);
                              
                              return (
                                <tr key={session.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {session.sessionId ? session.sessionId.substring(0, 8) + '...' : session.id.substring(0, 8) + '...'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{session.device}</div>
                                    <div className="text-xs text-gray-500">{session.screenSize}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {startTime ? startTime.toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {startTime ? startTime.toLocaleTimeString() : ''}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {duration > 0 ? formatTime(duration) : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {session.pgViewed?.length || 0} PGs
                                      </span>
                                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                        {session.searchQueries?.length || 0} searches
                                      </span>
                                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                        {session.shelterSwipeInteractions?.total || 0} swipes
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* PG Views Tab */}
                    {activeTab === 'pgs' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">PG Viewing History</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PG Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Viewed At
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Time Spent
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sessions.flatMap(session => 
                                (session.pgViewed || []).map((pg, index) => {
                                  const timeSpent = session.pgDetailsTimeSpent?.[pg.pgId] || 0;
                                  return (
                                    <tr key={`${session.id}-${pg.pgId}-${index}`}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pg.pgName}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pg.viewedAt ? new Date(pg.viewedAt).toLocaleString() : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {timeSpent > 0 ? formatTime(timeSpent) : 'Not viewed in detail'}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Searches Tab */}
                    {activeTab === 'searches' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Search History</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Query
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Timestamp
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sessions.flatMap(session => 
                                (session.searchQueries || []).map((search, index) => (
                                  <tr key={`${session.id}-search-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      "{search.query}"
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        search.isNearMe ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                      }`}>
                                        {search.isNearMe ? 'Near Me' : 'Regular'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {search.timestamp ? new Date(search.timestamp).toLocaleString() : 'N/A'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Swipes Tab */}
                    {activeTab === 'swipes' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Swipe History</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PG Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Direction
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Timestamp
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sessions.flatMap(session => 
                                (session.shelterSwipeInteractions?.pgIds || []).map((swipe, index) => (
                                  <tr key={`${session.id}-swipe-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {pgNames[swipe.pgId] || swipe.pgId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        swipe.direction === 'right' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {swipe.direction === 'right' ? 'Right (Like)' : 'Left (Skip)'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {swipe.timestamp ? new Date(swipe.timestamp).toLocaleString() : 'N/A'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-500 text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserActivityModal;
