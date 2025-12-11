const functions = require('firebase-functions');
const admin = require('firebase-admin');

// This endpoint allows testing notifications without needing service account keys locally
exports.testNotification = functions.https.onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method not allowed' });
      return;
    }
    
    const { token, title, body, data } = req.body;
    
    if (!token) {
      res.status(400).send({ error: 'Device token is required' });
      return;
    }
    
    // Message payload
    const message = {
      token: token,
      notification: {
        title: title || 'Test Notification',
        body: body || 'This is a test notification'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View'
            }
          ]
        },
        fcmOptions: {
          link: data?.url || 'https://www.shelterly.in/admin'
        }
      },
      data: data || {}
    };
    
    // Send the message
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    
    res.status(200).send({ 
      success: true, 
      messageId: response,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send({ 
      success: false, 
      error: error.message 
    });
  }
});
