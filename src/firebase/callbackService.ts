import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from './config';

export interface CallbackRequest {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  pgId: string;
  pgName: string;
  status: 'pending' | 'contacted' | 'resolved' | 'cancelled';
  message?: string;
  requestType?: 'callback' | 'visit';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = 'callbackRequests';

// Add a new callback request
export const addCallbackRequest = async (request: Omit<CallbackRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...request,
      createdAt: now,
      updatedAt: now
    });
    
    return { id: docRef.id, ...request, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('Error adding callback request:', error);
    throw error;
  }
};

// Get all callback requests
export const getAllCallbackRequests = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CallbackRequest[];
  } catch (error) {
    console.error('Error getting callback requests:', error);
    throw error;
  }
};

// Get callback requests by status
export const getCallbackRequestsByStatus = async (status: CallbackRequest['status']) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CallbackRequest[];
  } catch (error) {
    console.error('Error getting callback requests by status:', error);
    throw error;
  }
};

// Get callback requests by user
export const getCallbackRequestsByUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CallbackRequest[];
  } catch (error) {
    console.error('Error getting callback requests by user:', error);
    throw error;
  }
};

// Update a callback request status
export const updateCallbackRequestStatus = async (id: string, status: CallbackRequest['status']) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { 
      status, 
      updatedAt: Timestamp.now() 
    });
    
    return true;
  } catch (error) {
    console.error('Error updating callback request:', error);
    throw error;
  }
};
