"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldNotifications = exports.sendNotificationToDevices = exports.onNewCallbackRequestUpdated = exports.onNewVisitRequestUpdated = exports.onNewCallbackRequestFixed = exports.onNewVisitRequestFixed = exports.onNewCallbackRequest = exports.onNewVisitRequest = exports.onUserLoginUpdated = exports.onNewUserSignupUpdated = exports.onUserLogin = exports.onNewUserSignup = exports.sendTelegramNotification = exports.telegramWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// Reference to Firestore
const db = admin.firestore();
// Import and re-export Telegram bot functions
const telegramBot_1 = require("./telegramBot");
Object.defineProperty(exports, "telegramWebhook", { enumerable: true, get: function () { return telegramBot_1.telegramWebhook; } });
Object.defineProperty(exports, "sendTelegramNotification", { enumerable: true, get: function () { return telegramBot_1.sendTelegramNotification; } });
// Import and re-export user notification functions (disabled versions)
const userNotifications_1 = require("./userNotifications");
Object.defineProperty(exports, "onNewUserSignup", { enumerable: true, get: function () { return userNotifications_1.onNewUserSignup; } });
Object.defineProperty(exports, "onUserLogin", { enumerable: true, get: function () { return userNotifications_1.onUserLogin; } });
// Import and re-export updated user notification functions
const updatedUserNotifications_1 = require("./updatedUserNotifications");
Object.defineProperty(exports, "onNewUserSignupUpdated", { enumerable: true, get: function () { return updatedUserNotifications_1.onNewUserSignupUpdated; } });
Object.defineProperty(exports, "onUserLoginUpdated", { enumerable: true, get: function () { return updatedUserNotifications_1.onUserLoginUpdated; } });
// Import and re-export disabled versions of old notification functions
const disableOldFunctions_1 = require("./disableOldFunctions");
Object.defineProperty(exports, "onNewVisitRequest", { enumerable: true, get: function () { return disableOldFunctions_1.onNewVisitRequest; } });
Object.defineProperty(exports, "onNewCallbackRequest", { enumerable: true, get: function () { return disableOldFunctions_1.onNewCallbackRequest; } });
Object.defineProperty(exports, "onNewVisitRequestFixed", { enumerable: true, get: function () { return disableOldFunctions_1.onNewVisitRequestFixed; } });
Object.defineProperty(exports, "onNewCallbackRequestFixed", { enumerable: true, get: function () { return disableOldFunctions_1.onNewCallbackRequestFixed; } });
// Import and re-export updated notification functions with correct field mapping
const updatedNotifications_1 = require("./updatedNotifications");
Object.defineProperty(exports, "onNewVisitRequestUpdated", { enumerable: true, get: function () { return updatedNotifications_1.onNewVisitRequestUpdated; } });
Object.defineProperty(exports, "onNewCallbackRequestUpdated", { enumerable: true, get: function () { return updatedNotifications_1.onNewCallbackRequestUpdated; } });
/**
 * Cloud Function that triggers when a new notification document is created
 * in the 'notifications' collection. It sends the notification to all
 * specified devices using Firebase Cloud Messaging.
 */
exports.sendNotificationToDevices = functions.firestore
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
        const tokens = [];
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
        await updateNotificationStatus(context.params.notificationId, "sent", `Sent to ${response.successCount}/${tokens.length} devices`);
        // Handle failures if any
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.log(`Failed to send to token: ${tokens[idx]}, error:`, resp.error);
                }
            });
            console.log(`Failed to send to ${failedTokens.length} tokens`);
        }
        return { success: true, sentCount: response.successCount };
    }
    catch (error) {
        console.error("Error sending notification:", error);
        await updateNotificationStatus(context.params.notificationId, "failed", error instanceof Error ? error.message : "Unknown error");
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
});
/**
 * Helper function to update the status of a notification
 */
async function updateNotificationStatus(notificationId, status, message) {
    try {
        await db.collection("notifications").doc(notificationId).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            statusMessage: message || "",
        });
    }
    catch (error) {
        console.error("Error updating notification status:", error);
    }
}
/**
 * Clean up old notifications (older than 30 days)
 * Runs once a day
 */
exports.cleanupOldNotifications = functions.pubsub
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
    }
    catch (error) {
        console.error("Error cleaning up old notifications:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
});
//# sourceMappingURL=index.js.map