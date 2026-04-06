// Notification Service - Only logs to console for debugging
// All real notifications are sent via in-app website notifications

exports.sendSMS = async (mobile, message) => {
    // Removed actual SMS sending - keeping for backward compatibility
    // In-app notifications are sufficient
    console.log(`[NOTIFICATION] ${message}`);
    return true;
};
