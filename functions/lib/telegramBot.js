"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewVisitRequest = exports.onNewCallbackRequest = exports.sendTelegramNotification = exports.telegramWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// Reference to Firestore
const db = admin.firestore();
// Telegram Bot API endpoint
const TELEGRAM_API_BASE = "https://api.telegram.org/bot";
// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = "7845325656:AAGhazLPzt4psXv7voeQKlYbhMeJE5cx4t4";
/**
 * Cloud Function that handles Telegram bot webhook events
 * This function is triggered when a user interacts with the Telegram bot
 */
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
    // Verify this is a POST request
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const update = req.body;
    // Check if this is a valid Telegram update
    if (!update || !update.message) {
        res.status(400).send("Invalid request");
        return;
    }
    const { message } = update;
    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from.username || "Unknown";
    console.log(`Received message from Telegram: ${text} from ${username} (${chatId})`);
    try {
        // Handle connection code
        if (text && /^\d{6}$/.test(text)) {
            await handleConnectionCode(text, chatId, username);
        }
        else if (text === "/start") {
            // Handle start command
            await sendTelegramMessage(chatId, "Welcome to Shelterly Notification Bot! 🏠\n\n" +
                "I'll send you notifications about callback requests, visit schedules, and other important events.\n\n" +
                "To connect your Telegram account with Shelterly, please enter the 6-digit connection code from the Shelterly admin panel.");
        }
        else {
            // Handle unknown commands
            await sendTelegramMessage(chatId, "I don't understand that command. To connect your account, please enter the 6-digit connection code from the Shelterly admin panel.");
        }
        res.status(200).send("OK");
    }
    catch (error) {
        console.error("Error processing Telegram webhook:", error);
        res.status(500).send("Internal Server Error");
    }
});
/**
 * Cloud Function that sends notifications via Telegram
 * This function is triggered when a new notification document is created
 * with type: 'telegram'
 */
exports.sendTelegramNotification = functions.firestore
    .document("notifications/{notificationId}")
    .onCreate(async (snapshot, context) => {
    const notificationData = snapshot.data();
    if (!notificationData) {
        console.log("No notification data found");
        return null;
    }
    const { userId, telegramChatIds, notification, status, type } = notificationData;
    // Only process Telegram notifications
    if (type !== "telegram") {
        console.log(`Not a Telegram notification: ${type}`);
        return null;
    }
    if (status !== "pending") {
        console.log(`Notification status is not pending: ${status}`);
        return null;
    }
    if (!telegramChatIds || !Array.isArray(telegramChatIds) || telegramChatIds.length === 0) {
        console.log("No Telegram chat IDs specified in the notification");
        await updateNotificationStatus(context.params.notificationId, "failed", "No Telegram chat IDs specified");
        return null;
    }
    console.log(`Processing Telegram notification for user ${userId} to ${telegramChatIds.length} chats`);
    try {
        const title = notification.title || "Shelterly Notification";
        const body = notification.body || "You have a new notification";
        // Format the message for Telegram
        const message = `*${title}*\n\n${body}`;
        // Send to all specified chat IDs
        const results = await Promise.all(telegramChatIds.map(chatId => sendTelegramMessage(chatId, message)));
        // Count successful sends
        const successCount = results.filter(result => result).length;
        console.log(`Successfully sent messages: ${successCount}/${telegramChatIds.length}`);
        // Update the notification status
        await updateNotificationStatus(context.params.notificationId, "sent", `Sent to ${successCount}/${telegramChatIds.length} Telegram chats`);
        return { success: true, sentCount: successCount };
    }
    catch (error) {
        console.error("Error sending Telegram notification:", error);
        await updateNotificationStatus(context.params.notificationId, "failed", error instanceof Error ? error.message : "Unknown error");
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
});
/**
 * Cloud Function that listens for new callback requests and sends notifications
 */
exports.onNewCallbackRequest = functions.firestore
    .document("callbackRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    const callbackData = snapshot.data();
    if (!callbackData) {
        console.log("No callback data found");
        return null;
    }
    // Get all admin users
    const adminUsers = await db.collection("adminUsers").get();
    if (adminUsers.empty) {
        console.log("No admin users found");
        return null;
    }
    // For each admin, get their Telegram connections and send notification
    for (const adminDoc of adminUsers.docs) {
        const adminId = adminDoc.data().userId;
        // Get admin's Telegram connections
        const connections = await db.collection("telegramConnections")
            .where("userId", "==", adminId)
            .where("isActive", "==", true)
            .get();
        if (connections.empty) {
            console.log(`No active Telegram connections for admin ${adminId}`);
            continue;
        }
        // Get chat IDs
        const chatIds = connections.docs.map(doc => doc.data().telegramChatId);
        // Create notification
        await db.collection("notifications").add({
            userId: adminId,
            telegramChatIds: chatIds,
            notification: {
                title: "New Callback Request",
                body: `${callbackData.name || "Someone"} has requested a callback for ${callbackData.pgName || "a PG"}`,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
            type: "telegram"
        });
    }
    return { success: true };
});
/**
 * Cloud Function that listens for new visit requests and sends notifications
 */
exports.onNewVisitRequest = functions.firestore
    .document("visitRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    const visitData = snapshot.data();
    if (!visitData) {
        console.log("No visit data found");
        return null;
    }
    // Format the visit date
    let visitDateStr = "unknown date";
    try {
        if (visitData.visitDate) {
            // Handle different date formats
            if (typeof visitData.visitDate === "object" && visitData.visitDate.toDate) {
                // Firestore Timestamp
                visitDateStr = visitData.visitDate.toDate().toLocaleDateString();
            }
            else if (visitData.visitDate instanceof Date) {
                // JavaScript Date object
                visitDateStr = visitData.visitDate.toLocaleDateString();
            }
            else if (typeof visitData.visitDate === "string") {
                // String date
                visitDateStr = new Date(visitData.visitDate).toLocaleDateString();
            }
            else if (typeof visitData.visitDate === "number") {
                // Timestamp as number
                visitDateStr = new Date(visitData.visitDate).toLocaleDateString();
            }
        }
    }
    catch (e) {
        console.error("Error formatting visit date:", e);
    }
    // Get all admin users
    const adminUsers = await db.collection("adminUsers").get();
    if (adminUsers.empty) {
        console.log("No admin users found");
        return null;
    }
    // For each admin, get their Telegram connections and send notification
    for (const adminDoc of adminUsers.docs) {
        const adminId = adminDoc.data().userId;
        // Get admin's Telegram connections
        const connections = await db.collection("telegramConnections")
            .where("userId", "==", adminId)
            .where("isActive", "==", true)
            .get();
        if (connections.empty) {
            console.log(`No active Telegram connections for admin ${adminId}`);
            continue;
        }
        // Get chat IDs
        const chatIds = connections.docs.map(doc => doc.data().telegramChatId);
        // Create notification
        await db.collection("notifications").add({
            userId: adminId,
            telegramChatIds: chatIds,
            notification: {
                title: "New Visit Request",
                body: `${visitData.name || "Someone"} scheduled a visit for ${visitData.pgName || "a PG"} on ${visitDateStr}.`,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
            type: "telegram"
        });
    }
    return { success: true };
});
/**
 * Helper function to handle connection code from Telegram
 */
async function handleConnectionCode(code, chatId, username) {
    // Find the connection request with this code
    const requestsQuery = await db.collection("telegramConnectionRequests")
        .where("code", "==", code)
        .where("status", "==", "pending")
        .get();
    if (requestsQuery.empty) {
        await sendTelegramMessage(chatId, "❌ Invalid or expired connection code. Please generate a new code from the Shelterly admin panel.");
        return;
    }
    const requestDoc = requestsQuery.docs[0];
    const requestData = requestDoc.data();
    // Check if code is expired (15 minutes)
    const createdAt = requestData.createdAt.toDate();
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    if (diffMinutes > 15) {
        await sendTelegramMessage(chatId, "❌ Connection code has expired. Please generate a new code from the Shelterly admin panel.");
        // Update the request status
        await requestDoc.ref.update({
            status: "expired",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
    }
    try {
        // Create a new connection document
        await db.collection("telegramConnections").add({
            userId: requestData.userId,
            telegramChatId: chatId.toString(),
            telegramUsername: username,
            connectedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            userEmail: requestData.email,
            userDisplayName: requestData.displayName
        });
        // Update the request status
        await requestDoc.ref.update({
            status: "connected",
            telegramChatId: chatId.toString(),
            telegramUsername: username,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Send success message
        await sendTelegramMessage(chatId, "✅ Successfully connected to Shelterly!\n\n" +
            `Account: ${requestData.displayName || requestData.email}\n\n` +
            "You will now receive notifications about callback requests, visit schedules, and other important events.");
        console.log(`Successfully connected Telegram user ${username} (${chatId}) to Shelterly user ${requestData.userId}`);
    }
    catch (error) {
        console.error("Error connecting Telegram account:", error);
        await sendTelegramMessage(chatId, "❌ An error occurred while connecting your account. Please try again later.");
    }
}
/**
 * Helper function to send a message via Telegram Bot API
 */
async function sendTelegramMessage(chatId, text) {
    try {
        // Use the hardcoded bot token
        const botToken = TELEGRAM_BOT_TOKEN;
        // Send the message
        const response = await axios_1.default.post(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown"
        });
        if (response.status === 200 && response.data.ok) {
            return true;
        }
        else {
            console.error("Error sending Telegram message:", response.data);
            return false;
        }
    }
    catch (error) {
        console.error("Error sending Telegram message:", error);
        return false;
    }
}
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
//# sourceMappingURL=telegramBot.js.map