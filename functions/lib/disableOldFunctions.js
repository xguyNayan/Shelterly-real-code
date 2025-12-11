"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewCallbackRequestFixed = exports.onNewVisitRequestFixed = exports.onNewCallbackRequest = exports.onNewVisitRequest = void 0;
const functions = require("firebase-functions");
// Create disabled versions of the old notification functions
// This will effectively replace the old functions with non-functional versions
// that don't trigger notifications
/**
 * Disabled version of the original notification function
 */
exports.onNewVisitRequest = functions.firestore
    .document("visitRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    console.log("Original onNewVisitRequest function is disabled");
    return null;
});
/**
 * Disabled version of the original callback notification function
 */
exports.onNewCallbackRequest = functions.firestore
    .document("callbackRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    console.log("Original onNewCallbackRequest function is disabled");
    return null;
});
/**
 * Disabled version of the fixed notification function
 */
exports.onNewVisitRequestFixed = functions.firestore
    .document("visitRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    console.log("Fixed onNewVisitRequestFixed function is disabled");
    return null;
});
/**
 * Disabled version of the fixed callback notification function
 */
exports.onNewCallbackRequestFixed = functions.firestore
    .document("callbackRequests/{requestId}")
    .onCreate(async (snapshot, context) => {
    console.log("Fixed onNewCallbackRequestFixed function is disabled");
    return null;
});
//# sourceMappingURL=disableOldFunctions.js.map