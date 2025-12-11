import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Reference to Firestore
const db = admin.firestore();

/**
 * Cloud Function that listens for new callback requests and sends notifications
 * This version looks for admin users in the users collection with role: admin
 */
export const onNewCallbackRequestFixed = functions.firestore
  .document("callbackRequests/{requestId}")
  .onCreate(async (snapshot, context) => {
    const callbackData = snapshot.data();
    
    if (!callbackData) {
      console.log("No callback data found");
      return null;
    }
    
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
        
        // Create notification
        await db.collection("notifications").add({
          userId: adminEmail,
          telegramChatIds: chatIds,
          notification: {
            title: "New Callback Request",
            body: `*User:* ${callbackData.name || "Unknown"} (${callbackData.email || "No email"})
*Property:* ${callbackData.pgName || "Unknown PG"}
*Date:* ${new Date().toLocaleDateString()}
*Time:* ${new Date().toLocaleTimeString()}
*Message:* ${callbackData.message || "No message provided"}
*Phone:* ${callbackData.phone || "No phone provided"}`,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
          type: "telegram"
        });
        
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
          body: `*User:* ${callbackData.name || "Unknown"} (${callbackData.email || "No email"})
*Property:* ${callbackData.pgName || "Unknown PG"}
*Date:* ${new Date().toLocaleDateString()}
*Time:* ${new Date().toLocaleTimeString()}
*Message:* ${callbackData.message || "No message provided"}
*Phone:* ${callbackData.phone || "No phone provided"}`,
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
 * This version looks for admin users in the users collection with role: admin
 */
export const onNewVisitRequestFixed = functions.firestore
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
        } else if (visitData.visitDate instanceof Date) {
          // JavaScript Date object
          visitDateStr = visitData.visitDate.toLocaleDateString();
        } else if (typeof visitData.visitDate === "string") {
          // String date
          visitDateStr = new Date(visitData.visitDate).toLocaleDateString();
        } else if (typeof visitData.visitDate === "number") {
          // Timestamp as number
          visitDateStr = new Date(visitData.visitDate).toLocaleDateString();
        }
      }
    } catch (e) {
      console.error("Error formatting visit date:", e);
    }
    
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
        
        // Create notification
        await db.collection("notifications").add({
          userId: adminEmail,
          telegramChatIds: chatIds,
          notification: {
            title: "New Visit Request",
            body: `*User:* ${visitData.name || "Unknown"} (${visitData.email || "No email"})
*Property:* ${visitData.pgName || "Unknown PG"}
*Date:* ${visitDateStr}
*Time:* ${visitData.timeSlot || "No time specified"}
*Message:* ${visitData.message || "No message provided"}
*Phone:* ${visitData.phone || "No phone provided"}`,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
          type: "telegram"
        });
        
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
          body: `*User:* ${visitData.name || "Unknown"} (${visitData.email || "No email"})
*Property:* ${visitData.pgName || "Unknown PG"}
*Date:* ${visitDateStr}
*Time:* ${visitData.timeSlot || "No time specified"}
*Message:* ${visitData.message || "No message provided"}
*Phone:* ${visitData.phone || "No phone provided"}`,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending",
        type: "telegram"
      });
    }
    
    return { success: true };
  });
