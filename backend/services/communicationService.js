/**
 * Communication Service
 * Handles OTP generation, verification, and platform call routing
 * Prevents direct phone number sharing between customers and workers
 */

const crypto = require('crypto');

// ============================================================================
// OTP GENERATION & MANAGEMENT
// ============================================================================

/**
 * Generate a secure 4-digit OTP
 * @returns {string} 4-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate Communication ID in format COM-XXXX
 * @returns {string} Communication ID
 */
exports.generateCommunicationID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'COM-';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Calculate OTP expiration time (5 minutes from now)
 * @returns {Date} Expiration timestamp
 */
exports.getOTPExpiration = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Check if OTP has expired
 * @param {Date} expirationTime
 * @returns {boolean} true if expired
 */
exports.isOTPExpired = (expirationTime) => {
  return new Date() > new Date(expirationTime);
};

// ============================================================================
// OTP VERIFICATION
// ============================================================================

/**
 * Verify OTP against stored value
 * @param {string} providedOTP - OTP entered by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expirationTime - Expiration time
 * @returns {object} { valid: boolean, message: string }
 */
exports.verifyOTP = (providedOTP, storedOTP, expirationTime) => {
  // Check if OTP has expired
  if (this.isOTPExpired(expirationTime)) {
    return {
      valid: false,
      message: 'OTP has expired. Please request a new OTP.'
    };
  }

  // Check if OTP matches
  if (providedOTP.trim() !== storedOTP.trim()) {
    return {
      valid: false,
      message: 'Incorrect OTP. Please try again.'
    };
  }

  return {
    valid: true,
    message: 'OTP verified successfully'
  };
};

// ============================================================================
// COMMUNICATION ID MANAGEMENT
// ============================================================================

/**
 * Generate Communication ID with associated metadata
 * Used for linking customer and worker without exposing phone numbers
 * @param {string} customerId
 * @param {string} workerId
 * @param {string} bookingId
 * @returns {object} Communication metadata
 */
exports.createCommunicationRecord = (customerId, workerId, bookingId) => {
  return {
    communicationId: this.generateCommunicationID(),
    customerId,
    workerId,
    bookingId,
    createdAt: new Date(),
    callsSinceAcceptance: 0,
    lastCallTime: null,
    totalCallDuration: 0
  };
};

// ============================================================================
// CALL ROUTING LOGIC
// ============================================================================

/**
 * Build call routing object for Twilio/Exotel API
 * Structure: Customer → Platform Number → Worker
 * @param {string} customerPhone - Customer phone number (from DB, never exposed)
 * @param {string} workerPhone - Worker phone number (from DB, never exposed)
 * @param {string} platformPhoneNumber - Platform's phone number
 * @param {string} bookingId - Booking reference
 * @returns {object} Call routing configuration
 */
exports.buildCallRoutingConfig = (
  customerPhone,
  workerPhone,
  platformPhoneNumber,
  bookingId
) => {
  return {
    // Customer sees this number
    displayNumber: platformPhoneNumber,
    
    // Backend routing
    routing: {
      inboundFrom: customerPhone,
      routeTo: workerPhone,
      throughPlatform: platformPhoneNumber
    },
    
    // Metadata for call tracking
    metadata: {
      bookingId,
      callType: 'service-worker-connection',
      recordCall: true,
      enableCallRecording: true
    },
    
    // Security settings
    security: {
      maskPhoneNumbers: true,
      maskWorkerId: true,
      maskCustomerId: true
    }
  };
};

// ============================================================================
// RATE LIMITING FOR OTP
// ============================================================================

/**
 * OTP attempt tracking (in-memory or use Redis in production)
 * Prevents brute force attacks
 */
const otpAttempts = new Map();

/**
 * Record OTP verification attempt
 * @param {string} bookingId
 * @returns {object} { allowed: boolean, attemptsLeft: number, lockoutUntil: Date|null }
 */
exports.recordOTPAttempt = (bookingId) => {
  const maxAttempts = 3;
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes
  
  if (!otpAttempts.has(bookingId)) {
    otpAttempts.set(bookingId, {
      count: 1,
      firstAttemptTime: Date.now(),
      lockedUntil: null
    });
    return { allowed: true, attemptsLeft: maxAttempts - 1, lockoutUntil: null };
  }
  
  const attempt = otpAttempts.get(bookingId);
  
  // Check if in lockout period
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return {
      allowed: false,
      attemptsLeft: 0,
      lockoutUntil: new Date(attempt.lockedUntil),
      message: `Too many attempts. Try again after ${Math.ceil((attempt.lockedUntil - Date.now()) / 60000)} minutes.`
    };
  }
  
  // Reset if lockout period has passed
  if (attempt.lockedUntil && Date.now() > attempt.lockedUntil) {
    attempt.count = 1;
    attempt.lockedUntil = null;
    attempt.firstAttemptTime = Date.now();
    return { allowed: true, attemptsLeft: maxAttempts - 1, lockoutUntil: null };
  }
  
  // Increment attempt count
  attempt.count++;
  
  if (attempt.count >= maxAttempts) {
    attempt.lockedUntil = Date.now() + lockoutDuration;
    return {
      allowed: false,
      attemptsLeft: 0,
      lockoutUntil: new Date(attempt.lockedUntil),
      message: `Account locked due to too many attempts. Try again after 15 minutes.`
    };
  }
  
  return {
    allowed: true,
    attemptsLeft: maxAttempts - attempt.count,
    lockoutUntil: null
  };
};

/**
 * Clear OTP attempts for booking (after successful verification)
 * @param {string} bookingId
 */
exports.clearOTPAttempts = (bookingId) => {
  otpAttempts.delete(bookingId);
};

// ============================================================================
// TWILIO INTEGRATION (OPTIONAL - requires Twilio account)
// ============================================================================

/**
 * Initialize Twilio client (if TWILIO_ACCOUNT_SID in .env)
 * @returns {object|null} Twilio client or null if not configured
 */
exports.initializeTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️ Twilio not configured. Call routing will be simulated.');
    return null;
  }
  
  try {
    const twilio = require('twilio');
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.warn('⚠️ Twilio SDK not installed. To enable, run: npm install twilio');
    return null;
  }
};

/**
 * Initiate call through Twilio
 * Customer → Platform Number → Worker
 * @param {string} customerPhone
 * @param {string} workerPhone
 * @param {string} platformPhoneNumber
 * @param {string} bookingId
 * @returns {Promise} Call SID or simulation result
 */
exports.initiateCallViaTwilio = async (
  customerPhone,
  workerPhone,
  platformPhoneNumber,
  bookingId
) => {
  const twilioClient = this.initializeTwilioClient();
  
  if (!twilioClient) {
    // Simulation mode (Twilio not configured)
    return {
      simulated: true,
      callSID: `sim-${Date.now()}`,
      status: 'simulated',
      message: 'Call simulation (Twilio not configured). In production, call would be routed.',
      routing: {
        from: customerPhone,
        through: platformPhoneNumber,
        to: workerPhone,
        bookingId
      }
    };
  }
  
  try {
    // Create XML for call routing
    const callXML = `
      <Response>
        <Dial>
          <Number>${workerPhone}</Number>
        </Dial>
      </Response>
    `;
    
    // Initiate call from platform number to customer
    const call = await twilioClient.calls.create({
      from: platformPhoneNumber,
      to: customerPhone,
      url: `${process.env.BACKEND_URL}/api/bookings/${bookingId}/call-webhook`,
      record: 'true',
      recordingChannels: 'both',
      metadata: { bookingId },
      machineDetection: 'Enable'
    });
    
    return {
      callSID: call.sid,
      status: call.status,
      from: call.from,
      to: call.to,
      bookingId
    };
  } catch (err) {
    console.error('Twilio call initiation error:', err);
    throw new Error(`Failed to initiate call: ${err.message}`);
  }
};

// ============================================================================
// EXOTEL INTEGRATION (OPTIONAL)
// ============================================================================

/**
 * Initiate call through Exotel
 * @param {string} customerPhone
 * @param {string} workerPhone
 * @param {string} bookingId
 * @returns {Promise} Call response
 */
exports.initiateCallViaExotel = async (
  customerPhone,
  workerPhone,
  bookingId
) => {
  if (!process.env.EXOTEL_API_KEY || !process.env.EXOTEL_SID) {
    console.warn('⚠️ Exotel not configured.');
    return null;
  }
  
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      `https://api.exotel.com/v1/${process.env.EXOTEL_SID}/calls/connect.json`,
      {
        from: customerPhone,
        to: workerPhone,
        timedOut: 'hangup',
        customData: bookingId
      },
      {
        auth: {
          username: process.env.EXOTEL_SID,
          password: process.env.EXOTEL_API_KEY
        }
      }
    );
    
    return {
      provider: 'exotel',
      callID: response.data.Call.id,
      status: response.data.Call.status,
      bookingId
    };
  } catch (err) {
    console.error('Exotel call error:', err.message);
    throw new Error(`Exotel call failed: ${err.message}`);
  }
};

// ============================================================================
// CALL LOG MANAGEMENT
// ============================================================================

/**
 * Log call details for audit trail
 * @param {object} callData
 * @returns {object} Call log record
 */
exports.createCallLog = (callData) => {
  return {
    bookingId: callData.bookingId,
    callSID: callData.callSID || callData.callID,
    initiatedBy: callData.initiatedBy, // 'customer' or 'worker'
    initiatedAt: new Date(),
    status: callData.status || 'initiated',
    duration: 0,
    recordingURL: callData.recordingURL || null,
    metadata: callData.metadata || {}
  };
};

module.exports = exports;
