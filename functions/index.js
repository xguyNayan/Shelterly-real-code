const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { testNotification } = require('./src/testNotification');

// Initialize Firebase Admin
admin.initializeApp();

// Export the test notification function
exports.testNotification = testNotification;

// Function to send notifications to all registered devices when a new notification is created
exports.sendNotificationToDevices = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    try {
      const notificationData = snapshot.data();
      const { title, body, userId, data } = notificationData;
      
      if (!userId) {
        console.log('No userId specified in notification, skipping');
        return null;
      }
      
      // Get all device tokens for this user
      const tokensSnapshot = await admin.firestore()
        .collection('fcmTokens')
        .where('userId', '==', userId)
        .get();
      
      if (tokensSnapshot.empty) {
        console.log('No devices found for user:', userId);
        return null;
      }
      
      // Extract tokens
      const tokens = [];
      tokensSnapshot.forEach(doc => {
        let { token } = doc.data();
        
        // Handle different token formats
        if (token) {
          // Check if token is a stringified object (common for mobile)
          if (typeof token === 'string' && (token.startsWith('{') || token.includes('endpoint'))) {
            try {
              // Try to parse it as JSON
              const tokenObj = JSON.parse(token);
              
              // If it has an endpoint, it's a Web Push subscription
              if (tokenObj.endpoint) {
                console.log('Found Web Push subscription token for device');
                // For Web Push API, we need the entire subscription object
                // Store the original stringified token
                tokens.push(token);
              } else {
                // It's some other JSON object, try to extract token
                const extractedToken = tokenObj.token || tokenObj.fcmToken || token;
                tokens.push(extractedToken);
              }
            } catch (e) {
              // Not valid JSON, but might be a URL endpoint
              if (token.includes('https://fcm.googleapis.com/')) {
                console.log('Found endpoint URL token');
                tokens.push(token);
              } else {
                // Regular FCM token
                tokens.push(token);
              }
            }
          } else {
            // Regular FCM token
            tokens.push(token);
          }
        }
      });
      
      console.log(`Found ${tokens.length} devices for user ${userId}`);
      
      if (tokens.length === 0) {
        console.log('No valid tokens found');
        return null;
      }
      
      // Separate tokens into regular FCM tokens and Web Push subscriptions
      const fcmTokens = [];
      const webPushSubscriptions = [];
      
      tokens.forEach(token => {
        if (typeof token === 'string' && (token.startsWith('{') || token.includes('endpoint'))) {
          // This is a Web Push subscription
          webPushSubscriptions.push(token);
        } else {
          // This is a regular FCM token
          fcmTokens.push(token);
        }
      });
      
      console.log(`Processing ${fcmTokens.length} FCM tokens and ${webPushSubscriptions.length} Web Push subscriptions`);
      
      // Results tracking
      let successCount = 0;
      let failureCount = 0;
      const failedTokens = [];
      const responses = [];
      
      // 1. Send to regular FCM tokens if any
      if (fcmTokens.length > 0) {
        // Prepare notification message for FCM tokens
        const fcmMessage = {
          notification: {
            title,
            body,
          },
          data: data || {},
          tokens: fcmTokens,
          webpush: {
            headers: {
              Urgency: 'high'
            },
            notification: {
              icon: '/logo192.png',
              badge: '/logo192.png',
              vibrate: [200, 100, 200],
              requireInteraction: true,
            },
            fcmOptions: {
              link: data?.url || 'https://www.shelterly.in'
            }
          }
        };
        
        try {
          // Send multicast message to FCM tokens
          const fcmResponse = await admin.messaging().sendMulticast(fcmMessage);
          console.log(`FCM response: ${fcmResponse.successCount} successes, ${fcmResponse.failureCount} failures`);
          
          successCount += fcmResponse.successCount;
          failureCount += fcmResponse.failureCount;
          
          // Track failed tokens
          if (fcmResponse.failureCount > 0) {
            fcmResponse.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(fcmTokens[idx]);
                console.log('Failed to send to FCM token:', fcmTokens[idx], 'Error:', resp.error);
              }
            });
          }
          
          responses.push(fcmResponse);
        } catch (error) {
          console.error('Error sending to FCM tokens:', error);
          failureCount += fcmTokens.length;
        }
      }
      
      // 2. Send to Web Push subscriptions if any
      for (const subscriptionStr of webPushSubscriptions) {
        try {
          // Parse the subscription
          const subscription = JSON.parse(subscriptionStr);
          
          // Create a message specifically for this Web Push subscription
          const webPushMessage = {
            notification: {
              title,
              body,
            },
            webpush: {
              notification: {
                title,
                body,
                icon: '/logo192.png',
                badge: '/logo192.png',
                vibrate: [200, 100, 200],
                requireInteraction: true,
                data: data || {}
              }
            }
          };
          
          // Send message to this specific Web Push subscription
          await admin.messaging().sendToDevice(subscription, webPushMessage);
          successCount++;
        } catch (error) {
          console.error('Error sending to Web Push subscription:', error);
          failedTokens.push(subscriptionStr);
          failureCount++;
        }
      }
      
      // Create a response object similar to sendMulticast
      const response = {
        successCount,
        failureCount,
        responses,
        failedTokens
      };
      
      console.log(`${response.successCount} messages were sent successfully`);
      
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.log('Failed to send to token:', tokens[idx], 'Error:', resp.error);
          }
        });
        console.log('List of tokens that failed to receive the message:', failedTokens);
      }
      
      return { success: true, sent: response.successCount, failed: response.failureCount };
    } catch (error) {
      console.error('Error sending notification to devices:', error);
      return { error: error.message };
    }
  });
