"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserLogin = exports.onNewUserSignup = void 0;
exports.sendTelegramMessage = sendTelegramMessage;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// Reference to Firestore
const db = admin.firestore();
// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = "7845325656:AAGhazLPzt4psXv7voeQKlYbhMeJE5cx4t4";
// Telegram Bot API endpoint
const TELEGRAM_API_BASE = "https://api.telegram.org/bot";
/**
 * Cloud Function that listens for new user sign-ups and sends notifications
 */
exports.onNewUserSignup = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snapshot, context) => {
    const userData = snapshot.data();
    if (!userData) {
        console.log("No user data found");
        return null;
    }
    // Get user details
    const displayName = userData.displayName || "New User";
    const email = userData.email || "No email provided";
    // Format signup time for the notification message
    const signupTime = userData.createdAt ?
        (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)) :
        new Date();
    const formattedTime = signupTime.toLocaleString();
    console.log(`New user signed up: ${displayName} (${email})`);
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
                title: "New User Signup",
                body: `${displayName} (${email}) just signed up on Shelterly at ${formattedTime}!`,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
            type: "telegram"
        });
    }
    return { success: true };
});
/**
 * Cloud Function that listens for user logins and sends notifications
 * This uses the Firebase Authentication triggers
 */
exports.onUserLogin = functions.auth.user().onCreate((user) => {
    // This function will trigger when a new user is created in Firebase Authentication
    console.log(`New user created in Firebase Auth: ${user.displayName || user.email}`);
    // We'll create a document in a special collection to track this event
    // This will then trigger our Firestore onCreate function above
    return db.collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
});
/**
 * Helper function to send a message via Telegram Bot API
 * This is exported so it can be used by other functions if needed
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
//# sourceMappingURL=userNotifications.js.map