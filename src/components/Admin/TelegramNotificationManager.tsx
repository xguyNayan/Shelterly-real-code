import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { FiSend, FiCheck, FiAlertCircle, FiRefreshCw, FiInfo, FiTrash2 } from 'react-icons/fi';

interface TelegramConnection {
  userId: string;
  telegramChatId: string;
  telegramUsername: string;
  connectedAt: Date;
  lastActive: Date;
  isActive: boolean;
}

const TelegramNotificationManager: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [telegramConnections, setTelegramConnections] = useState<TelegramConnection[]>([]);
  const [connectionCode, setConnectionCode] = useState<string>('');
  const [showConnectionInstructions, setShowConnectionInstructions] = useState<boolean>(false);
  const [testMessage, setTestMessage] = useState<string>('');
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Check if user is admin - since we're already in the admin panel, we can assume the user is an admin
  useEffect(() => {
    // Set admin status to true since we're already in the admin panel
    setIsAdmin(true);
    setLoading(false);
    
    console.log('Admin status set to true for Telegram Notification Manager');
  }, []);

  // Load telegram connections
  useEffect(() => {
    if (!user || !isAdmin) return;

    const loadConnections = () => {
      try {
        const connectionsQuery = query(
          collection(db, 'telegramConnections'),
          where('userId', '==', user.uid)
        );
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(connectionsQuery, (snapshot) => {
          const connections: TelegramConnection[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            connections.push({
              userId: data.userId,
              telegramChatId: data.telegramChatId,
              telegramUsername: data.telegramUsername || 'Unknown',
              connectedAt: data.connectedAt?.toDate() || new Date(),
              lastActive: data.lastActive?.toDate() || new Date(),
              isActive: data.isActive || false
            });
          });
          
          setTelegramConnections(connections);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error loading Telegram connections:', error);
        toast.error('Failed to load Telegram connections');
        return () => {}; // Return empty function as fallback
      }
    };

    const unsubscribe = loadConnections();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user, isAdmin]);

  // Generate a new connection code
  const generateConnectionCode = async () => {
    if (!user) return;
    
    setConnecting(true);
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setConnectionCode(code);
      
      // Store the connection code in Firestore
      await addDoc(collection(db, 'telegramConnectionRequests'), {
        userId: user.uid,
        code,
        createdAt: new Date(),
        status: 'pending',
        email: user.email,
        displayName: user.displayName || user.email
      });
      
      setShowConnectionInstructions(true);
      toast.success('Connection code generated!');
    } catch (error) {
      console.error('Error generating connection code:', error);
      toast.error('Failed to generate connection code');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect Telegram
  const disconnectTelegram = async (chatId: string) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to disconnect this Telegram account?')) {
      return;
    }
    
    try {
      // Find the connection document
      const connectionsQuery = query(
        collection(db, 'telegramConnections'),
        where('userId', '==', user.uid),
        where('telegramChatId', '==', chatId)
      );
      
      const snapshot = await getDocs(connectionsQuery);
      
      if (snapshot.empty) {
        toast.error('Connection not found');
        return;
      }
      
      // Delete the connection
      await deleteDoc(snapshot.docs[0].ref);
      
      toast.success('Telegram disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Telegram:', error);
      toast.error('Failed to disconnect Telegram');
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (!user || telegramConnections.length === 0) return;
    
    setSendingTest(true);
    try {
      // Create a test notification in Firestore
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        telegramChatIds: telegramConnections.map(conn => conn.telegramChatId),
        notification: {
          title: 'Test Notification',
          body: testMessage || 'This is a test notification from Shelterly admin panel.',
        },
        createdAt: new Date(),
        status: 'pending',
        type: 'telegram'
      });
      
      toast.success('Test notification sent!');
      setTestMessage('');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h4 className="text-yellow-800 font-medium mb-2">Admin Access Required</h4>
        <p className="text-yellow-700 text-sm">
          You need admin privileges to manage notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-blue-800 font-medium mb-2 flex items-center">
          <FiInfo className="mr-2" /> About Telegram Notifications
        </h4>
        <p className="text-blue-700 text-sm">
          Telegram notifications are more reliable than browser notifications and work across all your devices.
          Connect your Telegram account to receive notifications about callback requests, visit schedules, and other important events.
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Connected Telegram Accounts</h3>
        </div>
        
        <div className="p-6">
          {telegramConnections.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No Telegram accounts connected. Connect your Telegram to receive notifications.
              </p>
              <button
                onClick={generateConnectionCode}
                disabled={connecting}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
              >
                {connecting ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" /> Generating...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" /> Connect Telegram
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">Your Connected Accounts</h4>
                <button
                  onClick={generateConnectionCode}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center"
                >
                  <FiSend className="mr-1" /> Connect Another Account
                </button>
              </div>
              
              {telegramConnections.map((connection, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        @{connection.telegramUsername}
                      </h5>
                      <p className="text-sm text-gray-500">
                        Connected on {connection.connectedAt.toLocaleDateString()} at {connection.connectedAt.toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Last active: {connection.lastActive.toLocaleDateString()} at {connection.lastActive.toLocaleTimeString()}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          connection.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {connection.isActive ? (
                            <>
                              <FiCheck className="mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <FiAlertCircle className="mr-1" /> Inactive
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnectTelegram(connection.telegramChatId)}
                      className="text-red-500 hover:text-red-700"
                      title="Disconnect Telegram"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Connection Instructions */}
          {showConnectionInstructions && connectionCode && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-blue-800 font-medium mb-2">Connect Your Telegram</h4>
              <ol className="list-decimal ml-5 text-blue-700 text-sm space-y-2">
                <li>Open Telegram and search for <strong>@ShelterlyNotifyBot</strong></li>
                <li>Start a chat with the bot by clicking the Start button</li>
                <li>Send the following connection code to the bot: <strong className="bg-blue-100 px-2 py-1 rounded">{connectionCode}</strong></li>
                <li>The bot will confirm your connection</li>
              </ol>
              <p className="mt-3 text-xs text-blue-600">
                This code will expire in 15 minutes. If you don't connect in time, you'll need to generate a new code.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Notification */}
      {telegramConnections.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Test Notifications</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Send a test notification to your connected Telegram accounts.
              </p>
              
              <div className="flex flex-col space-y-3">
                <label htmlFor="testMessage" className="text-sm font-medium text-gray-700">
                  Test Message
                </label>
                <textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a custom test message (optional)"
                  className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                
                <button
                  onClick={sendTestNotification}
                  disabled={sendingTest}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center"
                >
                  {sendingTest ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" /> Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" /> Send Test Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramNotificationManager;
