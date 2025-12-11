import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy, Timestamp, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../firebase/admin';
import { UserProfile } from '../../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiHome, FiSettings, FiLogOut, FiMenu, FiX, 
  FiActivity, FiBarChart2, FiPlus, FiSearch, FiEdit2, FiTrash2, FiCheck, FiUpload,
  FiPhone, FiFileText, FiInfo, FiCalendar, FiBell
} from 'react-icons/fi';
import PGOnboardingModal, { PGData } from './PGOnboardingModal';
import PGBulkUpload from './PGBulkUpload';
import CallbackRequests from './CallbackRequests';
import VisitRequests from './VisitRequests';
import ConfirmationModal from './ConfirmationModal';
import BlogAdmin from './BlogAdmin';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserActivityModal from './UserActivityModal';
import TelegramNotificationManager from './TelegramNotificationManager';

// Main AdminDashboard Component
const AdminDashboard = (): React.ReactElement => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pgs, setPgs] = useState<PGData[]>([]);
  const [draftPg, setDraftPg] = useState<PGData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pgLoading, setPgLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPgModal, setShowAddPgModal] = useState(false);
  const [editingPg, setEditingPg] = useState<PGData | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // User activity modal states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationType, setConfirmationType] = useState<'warning' | 'danger' | 'info' | 'success'>('warning');
  
  // Function to set up and show confirmation modal
  const showConfirmation = ({
    title,
    message,
    type,
    action
  }: {
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info' | 'success';
    action: () => Promise<void>;
  }) => {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationType(type);
    setConfirmationAction(() => action);
    setShowConfirmationModal(true);
  };

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        
        setUsers(fetchedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users data');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  // Check for draft PGs in localStorage
  const checkForDrafts = () => {
    try {
      const savedDraft = localStorage.getItem('pg_onboarding_draft');
      if (savedDraft) {
         ('🔍 Draft PG found in localStorage');
        const draftData = JSON.parse(savedDraft);
         ( { 
          name: draftData.name || 'Not set',
          photos: draftData.photos?.length || 0,
          lastUpdated: new Date().toLocaleString()
        });
        
        // Create a draft PG object to display in the list
        const draft: PGData = {
          ...draftData,
          id: 'draft-' + Date.now(), // Temporary ID for the draft
          status: 'draft' as any, // Add draft status (we'll handle this special case in the UI)
          updatedAt: new Date().toISOString() // Add timestamp
        };
        
        setDraftPg(draft);
        setHasDraft(true);
      } else {
         ('🔍 No draft PG found in localStorage');
        setDraftPg(null);
        setHasDraft(false);
      }
    } catch (error) {
      console.error('❌ Error checking for draft:', error);
      setDraftPg(null);
      setHasDraft(false);
    }
  };
  
  useEffect(() => {
    checkForDrafts();
  }, []);
  
  // Fetch PGs data
  const fetchPGs = async () => {
    try {
      setPgLoading(true);
      const pgsRef = collection(db, 'pgs');
      const q = query(pgsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedPGs: PGData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPGs.push({ id: doc.id, ...doc.data() } as PGData);
      });
      
      setPgs(fetchedPGs);
      setPgLoading(false);
    } catch (err) {
      console.error('Error fetching PGs:', err);
      setError('Failed to load PGs data');
      setPgLoading(false);
    }
  };
  
  // Filter PGs based on search query
  const filteredPgs = pgs.filter(pg => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pg.name?.toLowerCase().includes(searchLower) ||
      pg.location?.toLowerCase().includes(searchLower) ||
      pg.contactName?.toLowerCase().includes(searchLower)
    );
  });

  // Refresh PG list
  const refreshPgList = () => {
    fetchPGs();
    checkForDrafts();
     ('🔄 Refreshing PG list');
  };

  // Fetch PGs on component mount
  useEffect(() => {
    fetchPGs();
  }, []);

  // Add new PG to Firestore
  const handleAddPg = async (pgData: PGData) => {
    try {
      const pgsRef = collection(db, 'pgs');
      const newPgData = {
        ...pgData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'initial' as 'initial' | 'verification' | 'listing' | 'active',
        isVerified: false
      };
      
      // Clean the data by removing any undefined values before adding to Firestore
      const cleanedPgData = removeUndefinedValues(newPgData);
      
      const docRef = await addDoc(pgsRef, cleanedPgData);
      const newPg = { ...cleanedPgData, id: docRef.id };
      setPgs([newPg, ...pgs]);
      setShowAddPgModal(false);
    } catch (err) {
      console.error('Error adding PG:', err);
      setError('Failed to add PG');
    }
  };

  // Helper function to clean object by removing undefined values
  const removeUndefinedValues = (obj: any): any => {
    const cleanObj: any = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      // Skip undefined values
      if (value === undefined) return;
      
      // Handle nested objects
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleanObj[key] = removeUndefinedValues(value);
      } 
      // Handle arrays with potential objects inside
      else if (Array.isArray(value)) {
        cleanObj[key] = value.map(item => 
          item !== null && typeof item === 'object' ? removeUndefinedValues(item) : item
        );
      }
      // Handle primitive values
      else {
        cleanObj[key] = value;
      }
    });
    
    return cleanObj;
  };

  // Update PG status in Firestore
  const handleUpdatePgStatus = async (pgId: string, newStatus: 'initial' | 'verification' | 'listing' | 'active') => {
     (newStatus);
    try {
      const pgRef = doc(db, 'pgs', pgId);
      await updateDoc(pgRef, { status: newStatus });
      
      // Update local state
      setPgs(pgs.map(pg => pg.id === pgId ? { ...pg, status: newStatus } : pg));
      setSuccessMessage(`PG status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating PG status:', err);
      setError('Failed to update PG status');
    }
  };

  // Update existing PG in Firestore
  const handleUpdatePg = async (pgId: string, pgData: PGData) => {
    
    try {
      const pgRef = doc(db, 'pgs', pgId);
      const updatedPgData = {
        ...pgData,
        updatedAt: Timestamp.now()
      };
      
      // Clean the data by removing any undefined values
      const cleanedPgData = removeUndefinedValues(updatedPgData);
      
      await updateDoc(pgRef, cleanedPgData);
      setPgs(pgs.map(pg => pg.id === pgId ? { ...cleanedPgData, id: pgId } : pg));
      setShowAddPgModal(false);
      setEditingPg(null);
    } catch (err) {
      console.error('Error updating PG:', err);
      setError('Failed to update PG');
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardStats();
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return renderUsersTable();
      case 'pgs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">PGs Management</h2>
              <div className="flex space-x-2">
                <button
                  onClick={refreshPgList}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
                >
                  <FiActivity className="mr-2" size={16} />
                  Refresh List
                </button>
                <button
                  onClick={() => setShowAddPgModal(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center"
                >
                  <FiPlus className="mr-2" size={16} />
                  Add New PG
                </button>
              </div>
            </div>
            
            {/* PG List */}
            {pgLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                {/* PG Table would go here */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Display regular PGs */}
                      {filteredPgs.map((pg) => (
                        <tr key={pg.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{pg.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {/* Display location with proper type safety */}
                              {pg.location === null || pg.location === undefined
                                ? 'No location'
                                : typeof pg.location === 'string'
                                ? pg.location
                                : typeof pg.location === 'object' && pg.location !== null
                                ? (pg.location as Record<string, any>).address || 'Address not specified'
                                : 'Location format unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {String(pg.status) === 'draft' ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                                draft
                              </span>
                            ) : (
                              <select
                                value={pg.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as 'initial' | 'verification' | 'listing' | 'active';
                                  showConfirmation({
                                    title: 'Change PG Status',
                                    message: `Are you sure you want to change the status of "${pg.name}" to ${newStatus}?`,
                                    type: 'warning',
                                    action: async () => {
                                      await handleUpdatePgStatus(pg.id!, newStatus);
                                    }
                                  });
                                }}
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  pg.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  pg.status === 'verification' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <option value="initial">initial</option>
                                <option value="verification">verification</option>
                                <option value="listing">listing</option>
                                <option value="active">active</option>
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const newVerifiedStatus = !pg.isVerified;
                                const pgRef = doc(db, 'pgs', pg.id!);
                                updateDoc(pgRef, { isVerified: newVerifiedStatus })
                                  .then(() => {
                                    setPgs(pgs.map(p => p.id === pg.id ? {...p, isVerified: newVerifiedStatus} : p));
                                    setSuccessMessage(`PG ${newVerifiedStatus ? 'verified' : 'unverified'} successfully`);
                                  })
                                  .catch(err => console.error('Error updating verification status:', err));
                              }}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                pg.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {pg.isVerified ? 'Verified' : 'Not Verified'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                if (String(pg.status) === 'draft') {
                                  handleEditDraft();
                                } else {
                                  setEditingPg(pg);
                                  setShowAddPgModal(true);
                                }
                              }}    className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <FiEdit2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Display draft PG if it exists */}
                      {draftPg && (
                        <tr key={draftPg.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{draftPg.name || 'Unnamed Draft PG'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {draftPg.location || 'No location set'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                              draft
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Draft
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={handleEditDraft}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                showConfirmation({
                                  title: 'Delete Draft PG',
                                  message: `Are you sure you want to delete this draft? This action cannot be undone.`,
                                  type: 'danger',
                                  action: async () => {
                                    // localStorage caching removed
                                    setDraftPg(null);
                                    setHasDraft(false);
                                     ('🗑️ Draft PG deleted');
                                  }
                                });
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case 'callbacks':
        return <CallbackRequests />;
      case 'visits':
        return <VisitRequests />;
      case 'blog':
        return <BlogAdmin />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
            
            {/* Admin Notifications Section */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-primary-50 border-b border-primary-100 flex items-center">
                <FiBell className="text-primary-500 mr-2" size={20} />
                <h3 className="text-lg font-medium text-gray-800">Admin Notifications</h3>
              </div>
              <div className="p-6">
                <TelegramNotificationManager />
              </div>
            </div>
            
            {/* Other Settings Sections can be added here */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">General Settings</h3>
              <p className="text-gray-600">Additional settings will be available soon.</p>
            </div>
          </div>
        );
      default:
        return renderDashboardStats();
    }
  };

  // Handle editing draft PG
  const handleEditDraft = () => {
     ('🔄 Editing draft PG');
    setShowAddPgModal(true);
  };

  // Render dashboard stats
  const renderDashboardStats = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiUsers size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-800">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiHome size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total PGs</p>
                <p className="text-2xl font-semibold text-gray-800">{pgs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FiActivity size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active PGs</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {pgs.filter(pg => pg.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render users table
  const renderUsersTable = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Users Management</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.displayName || 'No Name'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{userItem.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiPhone className="mr-1" />
                          {userItem.whatsappNumber || 'No Phone'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userItem.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.createdAt instanceof Timestamp 
                          ? new Date(userItem.createdAt.toMillis()).toLocaleDateString() 
                          : userItem.createdAt instanceof Date 
                            ? userItem.createdAt.toLocaleDateString()
                            : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUserId(userItem.id);
                            setShowUserActivityModal(true);
                          }}
                          className="px-3 py-1 bg-primary-500 text-white text-xs rounded-full hover:bg-primary-600 focus:outline-none shadow-sm"
                          title="View User Activity"
                        >
                          Analytics
                        </button>
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-md z-20 ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-primary-600">Admin Panel</h1>
            )}
            <button 
              onClick={toggleSidebar} 
              className="p-1 rounded-full hover:bg-gray-100"
            >
              {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
            </button>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiActivity size={20} />
                  {!sidebarCollapsed && <span className="ml-4">Dashboard</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'analytics' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiBarChart2 size={20} />
                  {!sidebarCollapsed && <span className="ml-4">User Analytics</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'users' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiUsers size={20} />
                  {!sidebarCollapsed && <span className="ml-4">Users</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('pgs')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'pgs' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiHome size={20} />
                  {!sidebarCollapsed && <span className="ml-4">PGs</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('callbacks')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'callbacks' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiPhone size={20} />
                  {!sidebarCollapsed && <span className="ml-4">Callbacks</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('visits')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'visits' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiCalendar size={20} />
                  {!sidebarCollapsed && <span className="ml-4">Visit Requests</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('blog')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'blog' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiFileText size={20} />
                  {!sidebarCollapsed && <span className="ml-4">Blog</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === 'settings' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiSettings size={20} />
                  {!sidebarCollapsed && <span className="ml-4">Settings & Notifications</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-0 md:pt-0">
        <header className="bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">Admin Dashboard</h1>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.displayName}</p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 md:p-6">
          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center justify-between">
              <span>{successMessage}</span>
              <button 
                onClick={() => setSuccessMessage('')}
                className="text-green-700"
              >
                <FiX size={18} />
              </button>
            </div>
          )}
          
          {renderContent()}
        </main>
      </div>

      {/* PG Onboarding Modal */}
      <AnimatePresence>
        {showAddPgModal && (
          <PGOnboardingModal 
            isOpen={showAddPgModal}
            onClose={() => {
              setShowAddPgModal(false);
              setEditingPg(null); // Clear editing state when closing
            }}
            onSubmit={(pgData) => {
              if (editingPg && editingPg.id) {
                // If editing an existing PG
                handleUpdatePg(editingPg.id, pgData);
              } else {
                // If adding a new PG
                handleAddPg(pgData);
              }
            }}
            editData={editingPg}
          />
        )}
      </AnimatePresence>
      
      {/* PG Bulk Upload Modal */}
      <AnimatePresence>
        {showBulkUploadModal && (
          <PGBulkUpload
            isOpen={showBulkUploadModal}
            onClose={() => setShowBulkUploadModal(false)}
            onUpload={(pgDataList) => {
              // handleBulkUpload(pgDataList);
              
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={async () => {
          try {
            await confirmationAction();
            setShowConfirmationModal(false);
          } catch (error) {
            console.error('Error in confirmation action:', error);
          }
        }}
        title={confirmationTitle}
        message={confirmationMessage}
        type={confirmationType}
      />
      
      {/* User Activity Modal */}
      {selectedUserId && (
        <UserActivityModal
          isOpen={showUserActivityModal}
          onClose={() => {
            setShowUserActivityModal(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
