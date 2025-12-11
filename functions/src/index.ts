import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Reference to Firestore
const db = admin.firestore();

// Import and re-export Telegram bot functions
import { telegramWebhook, sendTelegramNotification } from './telegramBot';
export { telegramWebhook, sendTelegramNotification };

// Import and re-export user notification functions (disabled versions)
import { onNewUserSignup as disabledUserSignup, onUserLogin as disabledUserLogin } from './userNotifications';
export { disabledUserSignup as onNewUserSignup, disabledUserLogin as onUserLogin };

// Import and re-export updated user notification functions
import { onNewUserSignupUpdated, onUserLoginUpdated } from './updatedUserNotifications';
export { onNewUserSignupUpdated, onUserLoginUpdated };

// Import and re-export disabled versions of old notification functions
import { 
  onNewVisitRequest as disabledVisitRequest,
  onNewCallbackRequest as disabledCallbackRequest,
  onNewVisitRequestFixed as disabledVisitRequestFixed,
  onNewCallbackRequestFixed as disabledCallbackRequestFixed
} from './disableOldFunctions';

export {
  disabledVisitRequest as onNewVisitRequest,
  disabledCallbackRequest as onNewCallbackRequest,
  disabledVisitRequestFixed as onNewVisitRequestFixed,
  disabledCallbackRequestFixed as onNewCallbackRequestFixed
};

// Import and re-export updated notification functions with correct field mapping
import { onNewVisitRequestUpdated, onNewCallbackRequestUpdated } from './updatedNotifications';
export { onNewVisitRequestUpdated, onNewCallbackRequestUpdated };

/**
 * Cloud Function that triggers when a new notification document is created
 * in the 'notifications' collection. It sends the notification to all
 * specified devices using Firebase Cloud Messaging.
 */
export const sendNotificationToDevices = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    const notificationData = snapshot.data();
    
    if (!notificationData) {
      console.log("No notification data found");
      return null;
    }

    const { userId, devices, notification, status } = notificationData;

    if (status !== "pending") {
      console.log(`Notification status is not pending: ${status}`);
      return null;
    }

    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      console.log("No devices specified in the notification");
      await updateNotificationStatus(context.params.notificationId, "failed", "No devices specified");
      return null;
    }

    console.log(`Processing notification for user ${userId} to ${devices.length} devices`);

    try {
      // Get FCM tokens for all specified devices
      const tokens: string[] = [];
      
      for (const deviceId of devices) {
        const deviceDoc = await db.collection("fcmTokens").doc(deviceId).get();
        
        if (deviceDoc.exists) {
          const deviceData = deviceDoc.data();
          if (deviceData && deviceData.token) {
            tokens.push(deviceData.token);
          }
        }
      }

      if (tokens.length === 0) {
        console.log("No valid FCM tokens found for the specified devices");
        await updateNotificationStatus(context.params.notificationId, "failed", "No valid FCM tokens found");
        return null;
      }

      console.log(`Sending notification to ${tokens.length} devices`);

      // Prepare the notification message
      const message = {
        notification: {
          title: notification.title || "Shelterly Notification",
          body: notification.body || "You have a new notification",
          icon: notification.icon || "/logo192.png",
        },
        data: {
          clickAction: notification.clickAction || "/",
          notificationId: context.params.notificationId,
          timestamp: new Date().toISOString(),
        },
        tokens: tokens,
      };

      // Send the notification
      const response = await admin.messaging().sendMulticast(message);
      
      console.log(`Successfully sent messages: ${response.successCount}/${tokens.length}`);
      
      // Update the notification status
      await updateNotificationStatus(
        context.params.notificationId, 
        "sent", 
        `Sent to ${response.successCount}/${tokens.length} devices`
      );

      // Handle failures if any
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.log(`Failed to send to token: ${tokens[idx]}, error:`, resp.error);
          }
        });
        
        console.log(`Failed to send to ${failedTokens.length} tokens`);
      }

      return { success: true, sentCount: response.successCount };
    } catch (error) {
      console.error("Error sending notification:", error);
      await updateNotificationStatus(
        context.params.notificationId, 
        "failed", 
        error instanceof Error ? error.message : "Unknown error"
      );
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

/**
 * Helper function to update the status of a notification
 */
async function updateNotificationStatus(
  notificationId: string, 
  status: "pending" | "sent" | "failed", 
  message?: string
) {
  try {
    await db.collection("notifications").doc(notificationId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      statusMessage: message || "",
    });
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
}

/**
 * Clean up old notifications (older than 30 days)
 * Runs once a day
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule("0 0 * * *") // Run at midnight every day
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const oldNotificationsQuery = db.collection("notifications")
        .where("createdAt", "<", thirtyDaysAgo);
      
      const snapshot = await oldNotificationsQuery.get();
      
      if (snapshot.empty) {
        console.log("No old notifications to clean up");
        return null;
      }

      console.log(`Found ${snapshot.size} old notifications to clean up`);
      
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Successfully deleted ${snapshot.size} old notifications`);
      
      return { success: true, deletedCount: snapshot.size };
    } catch (error) {
      console.error("Error cleaning up old notifications:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
