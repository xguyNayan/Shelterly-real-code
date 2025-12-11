"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewCallbackRequestUpdated = exports.onNewVisitRequestUpdated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Reference to Firestore
const db = admin.firestore();
/**
 * Cloud Function that listens for new visit requests and sends notifications
 * This version correctly maps field names from the visitRequests collection
 */
exports.onNewVisitRequestUpdated = functions.firestore
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
    console.log("Visit data:", JSON.stringify(visitData, null, 2));
    // Get all admin users from users collection with role: admin
    const adminUsers = await db.collection("users").where("role", "==", "admin").get();
    if (adminUsers.empty) {
        console.log("No admin users found in users collection with role: admin");
        return null;
    }
    console.log(`Found ${adminUsers.size} admin users in users collection`);
    // For each admin, get their Telegram connections and send notification
    for (const adminDoc of adminUsers.docs) {
        const adminId = adminDoc.id; // Use document ID as the userId
        const adminEmail = adminDoc.data().email || "admin@shelterly.in";
        console.log(`Processing admin user: ${adminId} (${adminEmail})`);
        // Get admin's Telegram connections
        const connections = await db.collection("telegramConnections")
            .where("userId", "==", adminId)
            .where("isActive", "==", true)
            .get();
        if (connections.empty) {
            console.log(`No active Telegram connections for admin ${adminId}`);
            // Try with email as userId as a fallback
            const emailConnections = await db.collection("telegramConnections")
                .where("userId", "==", adminEmail)
                .where("isActive", "==", true)
                .get();
            if (emailConnections.empty) {
                console.log(`No active Telegram connections for admin email ${adminEmail} either`);
                continue;
            }
            // Use email connections
            const chatIds = emailConnections.docs.map(doc => doc.data().telegramChatId);
            // Create notification with correctly mapped field names
            await db.collection("notifications").add({
                userId: adminEmail,
                telegramChatIds: chatIds,
                notification: {
                    title: "New Visit Request",
                    body: `*User:* ${visitData.userName || "Unknown"} (${visitData.userEmail || "No email"})
*Property:* ${visitData.pgName || "Unknown PG"}
*Date:* ${visitDateStr}
*Time:* ${visitData.visitTime || "No time specified"}
*Message:* ${visitData.specialRequirements || visitData.message || "No message provided"}
*Phone:* ${visitData.userPhone || visitData.userWhatsappNumber || "No phone provided"}`,
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "pending",
                type: "telegram"
            });
            continue;
        }
        // Get chat IDs
        const chatIds = connections.docs.map(doc => doc.data().telegramChatId);
        // Create notification with correctly mapped field names
        await db.collection("notifications").add({
            userId: adminId,
            telegramChatIds: chatIds,
            notification: {
                title: "New Visit Request",
                body: `*User:* ${visitData.userName || "Unknown"} (${visitData.userEmail || "No email"})
*Property:* ${visitData.pgName || "Unknown PG"}
*Date:* ${visitDateStr}
*Time:* ${visitData.visitTime || "No time specified"}
*Message:* ${visitData.specialRequirements || visitData.message || "No message provided"}
*Phone:* ${visitData.userPhone || visitData.userWhatsappNumber || "No phone provided"}`,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
            type: "telegram"
        });
    }
    return { success: true };
});
/**
 * Cloud Function that listens for new callback requests and sends notifications
 * This version correctly maps field names from the callbackRequests collection
 */
exports.onNewCallbackRequestUpdated = functions.firestore
    .document("callbackRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    const callbackData = snapshot.data();
    if (!callbackData) {
        console.log("No callback data found");
        return null;
    }
    console.log("Callback data:", JSON.stringify(callbackData, null, 2));
    // Get all admin users from users collection with role: admin
    const adminUsers = await db.collection("users").where("role", "==", "admin").get();
    if (adminUsers.empty) {
        console.log("No admin users found in users collection with role: admin");
        return null;
    }
    console.log(`Found ${adminUsers.size} admin users in users collection`);
    // For each admin, get their Telegram connections and send notification
    for (const adminDoc of adminUsers.docs) {
        const adminId = adminDoc.id; // Use document ID as the userId
        const adminEmail = adminDoc.data().email || "admin@shelterly.in";
        console.log(`Processing admin user: ${adminId} (${adminEmail})`);
        // Get admin's Telegram connections
        const connections = await db.collection("telegramConnections")
            .where("userId", "==", adminId)
            .where("isActive", "==", true)
            .get();
        if (connections.empty) {
            console.log(`No active Telegram connections for admin ${adminId}`);
            // Try with email as userId as a fallback
            const emailConnections = await db.collection("telegramConnections")
                .where("userId", "==", adminEmail)
                .where("isActive", "==", true)
                .get();
            if (emailConnections.empty) {
                console.log(`No active Telegram connections for admin email ${adminEmail} either`);
                continue;
            }
            // Use email connections
            const chatIds = emailConnections.docs.map(doc => doc.data().telegramChatId);
            // Create notification with correctly mapped field names
            await db.collection("notifications").add({
                userId: adminEmail,
                telegramChatIds: chatIds,
                notification: {
                    title: "New Callback Request",
                    body: `*User:* ${callbackData.userName || callbackData.name || "Unknown"} (${callbackData.userEmail || callbackData.email || "No email"})
*Property:* ${callbackData.pgName || "Unknown PG"}
*Date:* ${new Date().toLocaleDateString()}
*Time:* ${new Date().toLocaleTimeString()}
*Message:* ${callbackData.message || callbackData.notes || "No message provided"}
*Phone:* ${callbackData.userPhone || callbackData.phone || callbackData.whatsappNumber || "No phone provided"}`,
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "pending",
                type: "telegram"
            });
            continue;
        }
        // Get chat IDs
        const chatIds = connections.docs.map(doc => doc.data().telegramChatId);
        // Create notification with correctly mapped field names
        await db.collection("notifications").add({
            userId: adminId,
            telegramChatIds: chatIds,
            notification: {
                title: "New Callback Request",
                body: `*User:* ${callbackData.userName || callbackData.name || "Unknown"} (${callbackData.userEmail || callbackData.email || "No email"})
*Property:* ${callbackData.pgName || "Unknown PG"}
*Date:* ${new Date().toLocaleDateString()}
*Time:* ${new Date().toLocaleTimeString()}
*Message:* ${callbackData.message || callbackData.notes || "No message provided"}
*Phone:* ${callbackData.userPhone || callbackData.phone || callbackData.whatsappNumber || "No phone provided"}`,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
            type: "telegram"
        });
    }
    return { success: true };
});
//# sourceMappingURL=updatedNotifications.js.map