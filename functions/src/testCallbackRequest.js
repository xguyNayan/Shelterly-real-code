const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
try {
  admin.initializeApp();
} catch (error) {
  // App already initialized
}

// Reference to Firestore
const db = admin.firestore();

// Function to create a test callback request
async function createTestCallbackRequest() {
  try {
    // Create a test callback request
    const result = await db.collection('callbackRequests').add({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      pgName: 'Test PG Accommodation',
      pgId: 'test-pg-id',
      message: 'This is a test callback request from the Telegram notification test',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });
    
    console.log(`Test callback request created with ID: ${result.id}`);
    return result.id;
  } catch (error) {
    console.error('Error creating test callback request:', error);
    return null;
  }
}

// Run the function
createTestCallbackRequest()
  .then(id => {
    console.log('Test completed, callback request ID:', id);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
