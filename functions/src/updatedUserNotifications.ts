import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Reference to Firestore
const db = admin.firestore();

/**
 * Cloud Function that listens for new user sign-ups and sends notifications
 * This version looks for admin users in the users collection with role: admin
 */
export const onNewUserSignupUpdated = functions.firestore
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
            title: "New User Signup",
            body: `*User:* ${displayName}\n*Email:* ${email}\n*Signup Time:* ${formattedTime}\n*User ID:* ${context.params.userId}`,
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
          title: "New User Signup",
          body: `*User:* ${displayName}\n*Email:* ${email}\n*Signup Time:* ${formattedTime}\n*User ID:* ${context.params.userId}`,
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
export const onUserLoginUpdated = functions.auth.user().onCreate((user) => {
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
