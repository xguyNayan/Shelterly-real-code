import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from './config';

export interface VisitRequest {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userWhatsappNumber?: string;
  pgId: string;
  pgName: string;
  status: 'pending' | 'contacted' | 'resolved' | 'cancelled';
  visitDate: string;
  visitTime: string;
  specialRequirements?: string;
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = 'visitRequests';

// Add a new visit request
export const addVisitRequest = async (request: Omit<VisitRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...request,
      createdAt: now,
      updatedAt: now
    });
    
    return { id: docRef.id, ...request, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('Error adding visit request:', error);
    throw error;
  }
};

// Get all visit requests
export const getAllVisitRequests = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VisitRequest[];
  } catch (error) {
    console.error('Error getting visit requests:', error);
    throw error;
  }
};

// Get visit requests by status
export const getVisitRequestsByStatus = async (status: VisitRequest['status']) => {
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
    })) as VisitRequest[];
  } catch (error) {
    console.error('Error getting visit requests by status:', error);
    throw error;
  }
};

// Get visit requests by user
export const getVisitRequestsByUser = async (userId: string) => {
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
    })) as VisitRequest[];
  } catch (error) {
    console.error('Error getting visit requests by user:', error);
    throw error;
  }
};

// Update a visit request status
export const updateVisitRequestStatus = async (id: string, status: VisitRequest['status']) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { 
      status, 
      updatedAt: Timestamp.now() 
    });
    
    return true;
  } catch (error) {
    console.error('Error updating visit request:', error);
    throw error;
  }
};

// Reschedule a visit
export const rescheduleVisit = async (id: string, newDate: string, newTime: string, message?: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = { 
      status: 'contacted', 
      visitDate: newDate,
      visitTime: newTime,
      updatedAt: Timestamp.now() 
    };
    
    if (message) {
      updateData.message = message;
    }
    
    await updateDoc(docRef, updateData);
    
    return true;
  } catch (error) {
    console.error('Error rescheduling visit:', error);
    throw error;
  }
};
