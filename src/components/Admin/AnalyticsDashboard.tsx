import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiUsers, FiClock, FiSearch, FiHeart, FiEye, FiBarChart2 } from 'react-icons/fi';

interface SessionData {
  id: string;
  sessionId: string;
  userId: string; // This will be the parent document ID
  isAuthenticated: boolean;
  startTime: any; // Firestore timestamp
  lastActive: any; // Firestore timestamp
  browser: string;
  device: string;
  screenSize: string;
  referrer: string;
  pgViewed: Array<{
    pgId: string;
    pgName: string;
    viewedAt: any; // Firestore timestamp
  }>;
  pgDetailsTimeSpent: {
    [pgId: string]: number; // seconds
  };
  searchQueries: Array<{
    query: string;
    isNearMe: boolean;
    timestamp: any; // Firestore timestamp
  }>;
  shelterSwipeInteractions: {
    total: number;
    left: number;
    right: number;
    pgIds: Array<{
      pgId: string;
      direction: 'left' | 'right';
      timestamp: any; // Firestore timestamp
    }>;
  };
}

interface UserData {
  id: string;
  isAnonymous?: boolean;
  displayName?: string;
  email?: string;
  createdAt: any;
  lastActive: any;
  sessions?: SessionData[];
}

const AnalyticsDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'pgs' | 'searches' | 'swipes' | 'users'>('overview');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // First, get all users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('lastActive', 'desc'), limit(50));
      const usersSnapshot = await getDocs(usersQuery);
      
      const sessionData: SessionData[] = [];
      const userData: Map<string, UserData> = new Map();
      
      // Process each user and get their analytics
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userInfo = userDoc.data();
        
        // Create user data object
        userData.set(userId, {
          id: userId,
          isAnonymous: userInfo.isAnonymous || false,
          displayName: userInfo.displayName,
          email: userInfo.email,
          createdAt: userInfo.createdAt,
          lastActive: userInfo.lastActive,
          sessions: []
        });
        
        // Get analytics for this user
        const analyticsRef = collection(db, 'users', userId, 'analytics');
        const analyticsQuery = query(analyticsRef, orderBy('startTime', 'desc'), limit(20));
        
        try {
          const analyticsSnapshot = await getDocs(analyticsQuery);
          
          // Process each analytics document
          analyticsSnapshot.forEach((doc) => {
            const sessionInfo = {
              id: doc.id,
              userId,
              ...doc.data()
            } as SessionData;
            
            sessionData.push(sessionInfo);
            
            // Add this session to the user's sessions
            const user = userData.get(userId)!;
            if (!user.sessions) user.sessions = [];
            user.sessions.push(sessionInfo);
          });
        } catch (analyticsErr) {
          console.warn(`Could not fetch analytics for user ${userId}:`, analyticsErr);
          // Continue with other users even if one fails
        }
      }
      
      setSessions(sessionData);
      setUsers(Array.from(userData.values()));
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalSessions = sessions.length;
  const authenticatedSessions = sessions.filter(s => s.isAuthenticated).length;
  const totalPGViews = sessions.reduce((sum, session) => 
    sum + (session.pgViewed && Array.isArray(session.pgViewed) ? session.pgViewed.length : 0), 0);
  
  const totalSearches = sessions.reduce((sum, session) => 
    sum + (session.searchQueries && Array.isArray(session.searchQueries) ? session.searchQueries.length : 0), 0);
  
  const nearMeSearches = sessions.reduce((sum, session) => 
    sum + (session.searchQueries && Array.isArray(session.searchQueries) ? 
      session.searchQueries.filter(q => q && q.isNearMe).length : 0), 0);

  const totalSwipes = sessions.reduce((sum, session) => 
    sum + (session.shelterSwipeInteractions?.total || 0), 0);
  
  const rightSwipes = sessions.reduce((sum, session) => 
    sum + (session.shelterSwipeInteractions?.right || 0), 0);
  
  const leftSwipes = sessions.reduce((sum, session) => 
    sum + (session.shelterSwipeInteractions?.left || 0), 0);

  // Get most viewed PGs
  const pgViewsMap = new Map<string, { id: string, name: string, views: number }>();
  sessions.forEach(session => {
    if (session.pgViewed && Array.isArray(session.pgViewed)) {
      session.pgViewed.forEach(pg => {
        if (pg && pg.pgId) {
          if (pgViewsMap.has(pg.pgId)) {
            const current = pgViewsMap.get(pg.pgId)!;
            pgViewsMap.set(pg.pgId, { ...current, views: current.views + 1 });
          } else {
            pgViewsMap.set(pg.pgId, { id: pg.pgId, name: pg.pgName || 'Unnamed PG', views: 1 });
          }
        }
      });
    }
  });
  
  const mostViewedPGs = Array.from(pgViewsMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Get most common search queries
  const searchQueryMap = new Map<string, number>();
  sessions.forEach(session => {
    if (session.searchQueries && Array.isArray(session.searchQueries)) {
      session.searchQueries.forEach(query => {
        if (query && query.query) {
          const queryText = query.query.toLowerCase();
          if (searchQueryMap.has(queryText)) {
            searchQueryMap.set(queryText, searchQueryMap.get(queryText)! + 1);
          } else {
            searchQueryMap.set(queryText, 1);
          }
        }
      });
    }
  });
  
  const topSearchQueries = Array.from(searchQueryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // Calculate average time spent on PG details pages
  const pgTimeMap = new Map<string, { id: string, name: string, totalTime: number, sessions: number }>();
  sessions.forEach(session => {
    if (session.pgDetailsTimeSpent && typeof session.pgDetailsTimeSpent === 'object') {
      Object.entries(session.pgDetailsTimeSpent).forEach(([pgId, time]) => {
        // Safely find the PG name
        const pgName = session.pgViewed && Array.isArray(session.pgViewed) ?
          (session.pgViewed.find(pg => pg && pg.pgId === pgId)?.pgName || 'Unknown PG') : 'Unknown PG';
        
        if (pgTimeMap.has(pgId)) {
          const current = pgTimeMap.get(pgId)!;
          pgTimeMap.set(pgId, { 
            ...current, 
            totalTime: current.totalTime + (typeof time === 'number' ? time : 0),
            sessions: current.sessions + 1
          });
        } else {
          pgTimeMap.set(pgId, { 
            id: pgId, 
            name: pgName, 
            totalTime: typeof time === 'number' ? time : 0, 
            sessions: 1 
          });
        }
      });
    }
  });
  
  const pgTimeSpentData = Array.from(pgTimeMap.values())
    .map(pg => ({
      ...pg,
      averageTime: Math.round(pg.totalTime / pg.sessions) // in seconds
    }))
    .sort((a, b) => b.averageTime - a.averageTime)
    .slice(0, 10);

  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={fetchSessions}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">User Analytics Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'sessions' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'pgs' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('pgs')}
        >
          PG Views
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'searches' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('searches')}
        >
          Searches
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'swipes' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('swipes')}
        >
          Swipes
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 text-primary-500 rounded-full">
                  <FiUsers size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                  <p className="text-2xl font-bold text-gray-800">{totalSessions}</p>
                  <p className="text-xs text-gray-500">
                    {authenticatedSessions} authenticated ({Math.round((authenticatedSessions / totalSessions) * 100) || 0}%)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 text-blue-500 rounded-full">
                  <FiEye size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total PG Views</h3>
                  <p className="text-2xl font-bold text-gray-800">{totalPGViews}</p>
                  <p className="text-xs text-gray-500">
                    Avg {(totalPGViews / totalSessions).toFixed(1)} per session
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 text-green-500 rounded-full">
                  <FiSearch size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Searches</h3>
                  <p className="text-2xl font-bold text-gray-800">{totalSearches}</p>
                  <p className="text-xs text-gray-500">
                    {nearMeSearches} Near Me ({Math.round((nearMeSearches / totalSearches) * 100) || 0}%)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-pink-100 text-pink-500 rounded-full">
                  <FiHeart size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Swipe Analytics</h3>
                  <p className="text-2xl font-bold text-gray-800">{totalSwipes}</p>
                  <p className="text-xs text-gray-500">
                    {rightSwipes} right ({Math.round((rightSwipes / totalSwipes) * 100) || 0}%) / {leftSwipes} left
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Viewed PGs</h3>
              {mostViewedPGs.length > 0 ? (
                <div className="space-y-3">
                  {mostViewedPGs.slice(0, 5).map((pg) => (
                    <div key={pg.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate max-w-[70%]">{pg.name}</span>
                      <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {pg.views} views
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No PG view data available</p>
              )}
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Search Queries</h3>
              {topSearchQueries.length > 0 ? (
                <div className="space-y-3">
                  {topSearchQueries.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate max-w-[70%]">"{item.query}"</span>
                      <span className="text-sm font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">
                        {item.count} searches
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No search query data available</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* PG Analytics Tab */}
      {activeTab === 'pgs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Viewed PGs</h3>
            {mostViewedPGs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mostViewedPGs.map((pg) => (
                      <tr key={pg.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pg.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {pg.views} views
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No PG view data available</p>
            )}
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Spent on PG Details Pages</h3>
            {pgTimeSpentData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pgTimeSpentData.map((pg) => (
                      <tr key={pg.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pg.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {formatTime(pg.averageTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pg.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No time spent data available</p>
            )}
          </div>
        </div>
      )}
      
      {/* Search Behavior Tab */}
      {activeTab === 'searches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Query Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Total Searches</h4>
                <p className="text-2xl font-bold text-gray-800">{totalSearches}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Near Me Searches</h4>
                <p className="text-2xl font-bold text-gray-800">
                  {nearMeSearches} ({Math.round((nearMeSearches / totalSearches) * 100) || 0}%)
                </p>
              </div>
            </div>
            
            {topSearchQueries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Query</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topSearchQueries.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">"{item.query}"</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.count} searches
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No search query data available</p>
            )}
          </div>
        </div>
      )}
      
      {/* Swipe Analytics Tab */}
      {activeTab === 'swipes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shelter Swipe Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Total Swipes</h4>
                <p className="text-2xl font-bold text-gray-800">{totalSwipes}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Right Swipes (Liked)</h4>
                <p className="text-2xl font-bold text-green-600">
                  {rightSwipes} ({Math.round((rightSwipes / totalSwipes) * 100) || 0}%)
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Left Swipes (Skipped)</h4>
                <p className="text-2xl font-bold text-red-500">
                  {leftSwipes} ({Math.round((leftSwipes / totalSwipes) * 100) || 0}%)
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Swipe Direction Ratio</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-l-full" 
                  style={{ width: `${Math.round((rightSwipes / totalSwipes) * 100) || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-green-600">Right: {Math.round((rightSwipes / totalSwipes) * 100) || 0}%</span>
                <span className="text-red-500">Left: {Math.round((leftSwipes / totalSwipes) * 100) || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Session Details Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent User Sessions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PGs Viewed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Searches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Swipes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.slice(0, 10).map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${session.isAuthenticated ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          <FiUsers size={16} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {session.isAuthenticated ? 'Authenticated' : 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.userId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.sessionId ? session.sessionId.substring(0, 8) + '...' : session.id.substring(0, 8) + '...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.device}</div>
                      <div className="text-xs text-gray-500">{session.screenSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.startTime?.toDate ? new Date(session.startTime.toDate()).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.startTime?.toDate ? new Date(session.startTime.toDate()).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.pgViewed?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.searchQueries?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {session.shelterSwipeInteractions && typeof session.shelterSwipeInteractions.right === 'number' ? session.shelterSwipeInteractions.right : 0} R
                        </span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {session.shelterSwipeInteractions && typeof session.shelterSwipeInteractions.left === 'number' ? session.shelterSwipeInteractions.left : 0} L
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Analytics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total PGs Viewed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Searches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Swipes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 10).map((user) => {
                  // Calculate user totals
                  const totalPGViews = user.sessions?.reduce((sum, session) => 
                    sum + (session.pgViewed && Array.isArray(session.pgViewed) ? session.pgViewed.length : 0), 0) || 0;
                  
                  const totalSearches = user.sessions?.reduce((sum, session) => 
                    sum + (session.searchQueries && Array.isArray(session.searchQueries) ? session.searchQueries.length : 0), 0) || 0;
                  
                  const totalSwipes = user.sessions?.reduce((sum, session) => 
                    sum + (session.shelterSwipeInteractions?.total || 0), 0) || 0;
                  
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${!user.isAnonymous ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                            <FiUsers size={16} />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {!user.isAnonymous ? 'Authenticated' : 'Anonymous'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.sessions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.lastActive?.toDate ? new Date(user.lastActive.toDate()).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.lastActive?.toDate ? new Date(user.lastActive.toDate()).toLocaleTimeString() : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalPGViews}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalSearches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalSwipes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
