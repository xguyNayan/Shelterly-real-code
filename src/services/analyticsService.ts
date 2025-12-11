import { collection, doc, setDoc, updateDoc, increment, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { debounce } from 'lodash';

// Collection references
const USERS_COLLECTION = 'users';
const ANALYTICS_SUBCOLLECTION = 'analytics';

// Generate a unique session ID if user is not logged in
const generateSessionId = () => {
  const sessionId = sessionStorage.getItem('shelterlySessionId');
  if (sessionId) return sessionId;
  
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('shelterlySessionId', newSessionId);
  return newSessionId;
};

// Get current user ID or session ID
const getUserOrSessionId = () => {
  const currentUser = auth.currentUser;
  return currentUser?.uid || generateSessionId();
};

// Initialize a new session
export const initializeSession = async () => {
  // Ensure we have a user ID, even for anonymous users
  let userId = auth.currentUser?.uid;
  if (!userId) {
    // For anonymous users, generate a session ID and store it
    userId = sessionStorage.getItem('shelterlyUserId');
    if (!userId) {
      userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('shelterlyUserId', userId);
       (`[INIT DEBUG] Created anonymous user ID: ${userId}`);
    } else {
       (`[INIT DEBUG] Using existing anonymous user ID: ${userId}`);
    }
  } else {
     (`[INIT DEBUG] Using authenticated user ID: ${userId}`);
  }
  
  const isAuthenticated = !!auth.currentUser;
  
  const sessionId = `session_${Date.now()}`;
  const now = new Date().toISOString();
  const sessionData = {
    sessionId,
    isAuthenticated,
    startTime: now,
    lastActive: now,
    sessionDuration: 0, // Initialize session duration to 0 seconds
    browser: navigator.userAgent,
    device: getDeviceType(),
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    referrer: document.referrer || 'direct',
    pgViewed: [],
    pgDetailsTimeSpent: {},
    searchQueries: [],
    shelterSwipeInteractions: {
      total: 0,
      left: 0,
      right: 0,
      pgIds: []
    }
  };

  try {
    // Store analytics as a subcollection under the user document
    const userRef = doc(db, USERS_COLLECTION, userId);
    const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), sessionId);
    
    // Create or update user document if it doesn't exist (for anonymous users)
    if (!isAuthenticated) {
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        // Create a basic user document for anonymous users
        const now = new Date().toISOString();
        await setDoc(userRef, {
          isAnonymous: true,
          createdAt: now,
          lastActive: now
        });
      }
    }
    
    // Create the analytics session document
    await setDoc(analyticsRef, sessionData);
    sessionStorage.setItem('shelterlySessionRef', sessionId);
    sessionStorage.setItem('shelterlyUserId', userId);
    return sessionId;
  } catch (error) {
    console.error('Error initializing analytics session:', error);
    return null;
  }
};

// Get device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Update last active timestamp and calculate session duration (debounced to reduce writes)
export const updateLastActive = debounce(async () => {
  const sessionId = sessionStorage.getItem('shelterlySessionRef');
  const userId = sessionStorage.getItem('shelterlyUserId');
  if (!sessionId || !userId) return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), sessionId);
    
    // Get the current analytics document to calculate session duration
    const analyticsDoc = await getDoc(analyticsRef);
    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data();
      const startTime = data.startTime ? new Date(data.startTime) : null;
      
      // Update last active timestamp
      const now = new Date();
      const nowIso = now.toISOString();
      
      // Calculate session duration in seconds
      let sessionDuration = 0;
      if (startTime) {
        sessionDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      }
      
      await updateDoc(analyticsRef, {
        lastActive: nowIso,
        sessionDuration: sessionDuration // Store duration in seconds
      });
      
       (`Updated session duration: ${sessionDuration} seconds`);
    }
  } catch (error) {
    console.error('Error updating last active timestamp:', error);
  }
}, 60000); // Update every minute at most

// Track PG listing view
export const trackPgView = async (pgId: string, pgName: string) => {
   (`Starting to track PG view: ${pgId} - ${pgName}`);
  const sessionId = sessionStorage.getItem('shelterlySessionRef');
  const userId = sessionStorage.getItem('shelterlyUserId');
  if (!sessionId || !userId) {
    // If session isn't initialized yet, initialize it first
    await initializeSession();
    // Get the newly created session ID
    const newSessionId = sessionStorage.getItem('shelterlySessionRef');
    const newUserId = sessionStorage.getItem('shelterlyUserId');
    if (!newSessionId || !newUserId) {
      console.error('Failed to initialize analytics session');
      return;
    }
  }

  // Get the session ID and user ID again (in case they were just initialized)
  const currentSessionId = sessionStorage.getItem('shelterlySessionRef');
  const currentUserId = sessionStorage.getItem('shelterlyUserId');
   (`[ANALYTICS DEBUG] Current session data: currentSessionId=${currentSessionId}, currentUserId=${currentUserId}`);
  
  if (!currentSessionId || !currentUserId) {
    console.error('[ANALYTICS DEBUG] Still no valid session after initialization attempt');
    return;
  }

  try {
     (`Tracking PG view: ${pgId} - ${pgName}`);
    const userRef = doc(db, USERS_COLLECTION, currentUserId);
    const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), currentSessionId);
    const analyticsDoc = await getDoc(analyticsRef);
    
    // Use a timestamp string instead of serverTimestamp() in arrays
    const now = new Date().toISOString();
    
    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data();
      const pgViewed = data.pgViewed || [];
      
      // Only add if not already viewed in this session
      if (!pgViewed.some(pg => pg.pgId === pgId)) {
         (`Adding PG ${pgId} to viewed list`);
        await updateDoc(analyticsRef, {
          pgViewed: [...pgViewed, { 
            pgId, 
            pgName, 
            viewedAt: now 
          }]
        });
      } else {
         (`PG ${pgId} already in viewed list`);
      }
    } else {
       ('Analytics document does not exist, creating it');
      // Create the document if it doesn't exist
      await setDoc(analyticsRef, {
        sessionId: currentSessionId,
        userId: currentUserId,
        createdAt: now,
        device: navigator.userAgent,
        pgViewed: [{
          pgId,
          pgName,
          viewedAt: now
        }],
        pgDetailsTimeSpent: {},
        shelterSwipeInteractions: {
          total: 0,
          left: 0,
          right: 0,
          pgIds: []
        },
        searchQueries: []
      });
    }
  } catch (error) {
    console.error('Error tracking PG view:', error);
  }
};

// Track time spent on PG details page
let pgDetailsTimer: number | null = null;
let currentPgId: string | null = null;
let timeSpent = 0;

export const startPgDetailsTimer = (pgId: string) => {
   (`Starting PG details timer for ${pgId}`);
  // Clear any existing timer
  if (pgDetailsTimer) {
    clearInterval(pgDetailsTimer);
  }
  
  // Check if session is initialized
  const sessionId = sessionStorage.getItem('shelterlySessionRef');
  const userId = sessionStorage.getItem('shelterlyUserId');
  if (!sessionId || !userId) {
    // Initialize session if needed
    initializeSession().then(() => {
      // Continue with timer setup
      currentPgId = pgId;
      timeSpent = 0;
      
      // Start a new timer that increments every second
      pgDetailsTimer = window.setInterval(() => {
        timeSpent += 1;
      }, 1000);
    });
  } else {
    // Session already initialized, proceed normally
    currentPgId = pgId;
    timeSpent = 0;
    
    // Start a new timer that increments every second
    pgDetailsTimer = window.setInterval(() => {
      timeSpent += 1;
    }, 1000);
  }
};

export const stopPgDetailsTimer = async () => {
  if (pgDetailsTimer && currentPgId) {
     (`Stopping PG details timer for ${currentPgId}. Time spent: ${timeSpent} seconds`);
    clearInterval(pgDetailsTimer);
    
    const sessionId = sessionStorage.getItem('shelterlySessionRef');
    const userId = sessionStorage.getItem('shelterlyUserId');
    if (!sessionId || !userId) {
      console.error('No session ID or user ID found when stopping timer');
      return;
    }
    
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), sessionId);
      const analyticsDoc = await getDoc(analyticsRef);
      
      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        const pgDetailsTimeSpent = data.pgDetailsTimeSpent || {};
        
        // Add time to existing or create new
        const existingTime = pgDetailsTimeSpent[currentPgId] || 0;
        const newTotalTime = existingTime + timeSpent;
        
         (`Updating time spent for PG ${currentPgId}: ${existingTime} + ${timeSpent} = ${newTotalTime}`);
        
        await updateDoc(analyticsRef, {
          [`pgDetailsTimeSpent.${currentPgId}`]: newTotalTime
        });
      } else {
         ('Analytics document does not exist when stopping timer');
        // Create the document if it doesn't exist
        const now = new Date().toISOString();
        await setDoc(analyticsRef, {
          sessionId,
          userId,
          createdAt: now,
          lastActive: now,
          device: navigator.userAgent,
          pgViewed: [],
          pgDetailsTimeSpent: {
            [currentPgId]: timeSpent
          },
          shelterSwipeInteractions: {
            total: 0,
            left: 0,
            right: 0,
            pgIds: []
          },
          searchQueries: []
        });
      }
    } catch (error) {
      console.error('Error tracking PG details time:', error);
    }
    
    pgDetailsTimer = null;
    currentPgId = null;
    timeSpent = 0;
  }
};

// Track shelter swipe interactions
export const trackShelterSwipe = async (pgId: string, direction: 'left' | 'right') => {
   (`[ANALYTICS DEBUG] trackShelterSwipe called with pgId=${pgId}, direction=${direction}`);
  
  // Check session data
  const sessionId = sessionStorage.getItem('shelterlySessionRef');
  const userId = sessionStorage.getItem('shelterlyUserId');
   (`[ANALYTICS DEBUG] Initial session check: sessionId=${sessionId}, userId=${userId}`);
  
  if (!sessionId || !userId) {
     ('[ANALYTICS DEBUG] No session found, initializing new session');
    // If session isn't initialized yet, initialize it first
    try {
      const result = await initializeSession();
       (`[ANALYTICS DEBUG] Session initialization result: ${result}`);
      
      // Get the newly created session ID
      const newSessionId = sessionStorage.getItem('shelterlySessionRef');
      const newUserId = sessionStorage.getItem('shelterlyUserId');
       (`[ANALYTICS DEBUG] After initialization: newSessionId=${newSessionId}, newUserId=${newUserId}`);
      
      if (!newSessionId || !newUserId) {
        console.error('[ANALYTICS DEBUG] Failed to initialize analytics session');
        return;
      }
    } catch (error) {
      console.error('[ANALYTICS DEBUG] Error during session initialization:', error);
      return;
    }
  }

  // Get the session ID and user ID again (in case they were just initialized)
  const currentSessionId = sessionStorage.getItem('shelterlySessionRef');
  const currentUserId = sessionStorage.getItem('shelterlyUserId');
   (`[ANALYTICS DEBUG] Current session data: currentSessionId=${currentSessionId}, currentUserId=${currentUserId}`);
  
  if (!currentSessionId || !currentUserId) {
    console.error('[ANALYTICS DEBUG] Still no valid session after initialization attempt');
    return;
  }

  try {
     (`[ANALYTICS DEBUG] Tracking shelter swipe: ${pgId} - ${direction}`);
     (`[ANALYTICS DEBUG] Creating refs with USERS_COLLECTION=${USERS_COLLECTION}, ANALYTICS_SUBCOLLECTION=${ANALYTICS_SUBCOLLECTION}`);
    
    const userRef = doc(db, USERS_COLLECTION, currentUserId);
     (`[ANALYTICS DEBUG] Created userRef: ${userRef.path}`);
    
    const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), currentSessionId);
     (`[ANALYTICS DEBUG] Created analyticsRef: ${analyticsRef.path}`);
    
    // First check if the document exists
     ('[ANALYTICS DEBUG] Checking if analytics document exists...');
    const analyticsDoc = await getDoc(analyticsRef);
     (`[ANALYTICS DEBUG] Document exists: ${analyticsDoc.exists()}`);
    
    if (analyticsDoc.exists()) {
      // Document exists, update it
       ('[ANALYTICS DEBUG] Analytics document exists, updating swipe data');
      // Use a timestamp string instead of serverTimestamp() in arrays
      const now = new Date().toISOString();
       (`[ANALYTICS DEBUG] Using timestamp: ${now}`);
      
      const updateData = {
        'shelterSwipeInteractions.total': increment(1),
        [`shelterSwipeInteractions.${direction}`]: increment(1),
        'shelterSwipeInteractions.pgIds': arrayUnion({
          pgId,
          direction,
          timestamp: now
        })
      };
      
      try {
        await updateDoc(analyticsRef, updateData);
         ('[ANALYTICS DEBUG] Successfully updated document');
      } catch (updateError) {
        console.error('[ANALYTICS DEBUG] Error updating document:', updateError);
        if (updateError instanceof Error) {
          console.error('[ANALYTICS DEBUG] Error details:', updateError.message);
          console.error('[ANALYTICS DEBUG] Error stack:', updateError.stack);
        }
        throw updateError; // Re-throw to be caught by outer catch
      }
    } else {
      // Document doesn't exist, create it with initial swipe data
       ('[ANALYTICS DEBUG] Analytics document does not exist, creating it with swipe data');
      // Use a timestamp string instead of serverTimestamp() in arrays
      const now = new Date().toISOString();
       (`[ANALYTICS DEBUG] Using timestamp: ${now}`);
      
      const newDocData = {
        sessionId: currentSessionId,
        userId: currentUserId,
        createdAt: now,
        device: navigator.userAgent,
        shelterSwipeInteractions: {
          total: 1,
          [direction]: 1,
          pgIds: [{
            pgId,
            direction,
            timestamp: now
          }]
        },
        pgViewed: [],
        pgDetailsTimeSpent: {},
        searchQueries: []
      };
      
      try {
        await setDoc(analyticsRef, newDocData);
      } catch (setDocError) {
        console.error('[ANALYTICS DEBUG] Error creating document:', setDocError);
        if (setDocError instanceof Error) {
          console.error('[ANALYTICS DEBUG] Error details:', setDocError.message);
          console.error('[ANALYTICS DEBUG] Error stack:', setDocError.stack);
        }
        throw setDocError; // Re-throw to be caught by outer catch
      }
    }
     ('[ANALYTICS DEBUG] Successfully tracked swipe interaction');
  } catch (error) {
    console.error('[ANALYTICS DEBUG] Error tracking shelter swipe:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('[ANALYTICS DEBUG] Error details:', error.message);
      console.error('[ANALYTICS DEBUG] Error stack:', error.stack);
    }
    
    // Try to get more context about the error
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
         (`[ANALYTICS DEBUG] ${key}: ${sessionStorage.getItem(key)}`);
      }
    }
  }
};

// Track search queries
export const trackSearchQuery = async (query: string, isNearMe: boolean) => {
   (`Starting to track search query: ${query} (Near Me: ${isNearMe})`);
  
  // Make sure we have a session
  const sessionId = sessionStorage.getItem('shelterlySessionRef');
  const userId = sessionStorage.getItem('shelterlyUserId');
  
  if (!sessionId || !userId) {
     ('No session found, initializing a new session');
    // If session isn't initialized yet, initialize it first
    try {
      await initializeSession();
      // Get the newly created session ID
      const newSessionId = sessionStorage.getItem('shelterlySessionRef');
      const newUserId = sessionStorage.getItem('shelterlyUserId');
      if (!newSessionId || !newUserId) {
        console.error('Failed to initialize analytics session');
        return;
      }
    } catch (initError) {
      console.error('Error initializing session:', initError);
      return;
    }
  }

  // Get the session ID and user ID again (in case they were just initialized)
  const currentSessionId = sessionStorage.getItem('shelterlySessionRef');
  const currentUserId = sessionStorage.getItem('shelterlyUserId');
  
  if (!currentSessionId || !currentUserId) {
    console.error('Still no session ID or user ID after initialization');
    return;
  }

  try {
     (`Tracking search query: ${query} (Near Me: ${isNearMe})`);
     (`Session ID: ${currentSessionId}, User ID: ${currentUserId}`);
    
    const userRef = doc(db, USERS_COLLECTION, currentUserId);
    const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), currentSessionId);
    
    // Check if the user document exists first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
       ('User document does not exist, creating it');
      const now = new Date().toISOString();
      await setDoc(userRef, {
        userId: currentUserId,
        createdAt: now,
        lastActive: now
      });
    }
    
    // Now check if the analytics document exists
    const analyticsDoc = await getDoc(analyticsRef);
    
    // Use a timestamp string instead of serverTimestamp() in arrays
    const now = new Date().toISOString();
    
    if (analyticsDoc.exists()) {
       ('Analytics document exists, updating search queries');
      const data = analyticsDoc.data();
      const searchQueries = data.searchQueries || [];
      
      await updateDoc(analyticsRef, {
        searchQueries: [...searchQueries, {
          query,
          isNearMe,
          timestamp: now
        }],
        lastActive: now
      });
       ('Successfully updated search queries');
    } else {
       ('Analytics document does not exist, creating it with search query');
      // Create the document if it doesn't exist
      const now = new Date().toISOString();
      await setDoc(analyticsRef, {
        sessionId: currentSessionId,
        userId: currentUserId,
        createdAt: now,
        lastActive: now,
        device: navigator.userAgent,
        pgViewed: [],
        pgDetailsTimeSpent: {},
        shelterSwipeInteractions: {
          total: 0,
          left: 0,
          right: 0,
          pgIds: []
        },
        searchQueries: [{
          query,
          isNearMe,
          timestamp: now
        }]
      });
       ('Successfully created analytics document with search query');
    }
  } catch (error) {
    console.error('Error tracking search query:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

// Track general events
export const trackEvent = async (category: string, action: string, label?: string, value?: number) => {
  console.log(`Event tracked:`, { category, action, label, value });
  const sessionId = sessionStorage.getItem('shelterlySessionRef');
  const userId = sessionStorage.getItem('shelterlyUserId');
  if (!sessionId || !userId) {
    // If session isn't initialized yet, initialize it first
    await initializeSession();
    // Get the newly created session ID
    const newSessionId = sessionStorage.getItem('shelterlySessionRef');
    const newUserId = sessionStorage.getItem('shelterlyUserId');
    if (!newSessionId || !newUserId) {
      console.error('Failed to initialize analytics session for event tracking');
      return;
    }
  }

  // Get the session ID and user ID again (in case they were just initialized)
  const currentSessionId = sessionStorage.getItem('shelterlySessionRef');
  const currentUserId = sessionStorage.getItem('shelterlyUserId');
   (`[ANALYTICS DEBUG] Current session data: currentSessionId=${currentSessionId}, currentUserId=${currentUserId}`);
  
  if (!currentSessionId || !currentUserId) {
    console.error('[ANALYTICS DEBUG] Still no valid session after initialization attempt');
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, currentUserId);
    const analyticsRef = doc(collection(userRef, ANALYTICS_SUBCOLLECTION), currentSessionId);
    
    // Check if the document exists
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (analyticsDoc.exists()) {
      // Add the event to the events array if it exists, otherwise create it
      // Use a timestamp string instead of serverTimestamp() in arrays
      const now = new Date().toISOString();
      
      // Create event object without undefined values
      const eventData: any = {
        category,
        action,
        timestamp: now
      };
      
      // Only add label and value if they are defined
      if (label !== undefined) eventData.label = label;
      if (value !== undefined) eventData.value = value;
      
      await updateDoc(analyticsRef, {
        events: arrayUnion(eventData)
      });
    } else {
      // Create the document with the event
      // Use a timestamp string instead of serverTimestamp() in arrays
      const now = new Date().toISOString();
      await setDoc(analyticsRef, {
        sessionId: currentSessionId,
        userId: currentUserId,
        createdAt: now,
        device: navigator.userAgent,
        events: [{
          category,
          action,
          ...(label !== undefined ? { label } : {}),
          ...(value !== undefined ? { value } : {}),
          timestamp: now
        }],
        pgViewed: [],
        pgDetailsTimeSpent: {},
        shelterSwipeInteractions: {
          total: 0,
          left: 0,
          right: 0,
          pgIds: []
        },
        searchQueries: []
      });
    }
  } catch (error) {
    console.error('Error tracking event in Firestore:', error);
  }
};

// Initialize analytics on app load
export const initializeAnalytics = () => {
  // Initialize session
  initializeSession();
  
  // Set up event listeners for page visibility and beforeunload
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateLastActive();
    } else {
      // If PG details timer is running, pause it when tab is not visible
      if (pgDetailsTimer && currentPgId) {
        stopPgDetailsTimer();
      }
    }
  });
  
  window.addEventListener('beforeunload', () => {
    // Sync any remaining data before page unloads
    if (pgDetailsTimer && currentPgId) {
      stopPgDetailsTimer();
    }
  });
  
  // Update last active periodically
  setInterval(updateLastActive, 60000);
};
