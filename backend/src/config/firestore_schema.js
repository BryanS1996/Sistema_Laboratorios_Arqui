/**
 * Firestore Collections Schema Definition
 * 
 * This file documents the structure of Firestore collections.
 * Firestore is schema-less, but this serves as documentation and validation reference.
 */

const COLLECTIONS = {
    USERS: 'users',
    REFRESH_TOKENS: 'refreshTokens',
    SSO_PROVIDERS: 'ssoProviders',
    TIME_SLOTS: 'timeSlots',
    AUDIT_LOGS: 'auditLogs',
    NOTIFICATIONS: 'notifications'
};

/**
 * Collection: users
 * Stores user profile information
 */
const UserSchema = {
    id: 'string',              // Auto-generated document ID or Firebase UID
    email: 'string',           // User email (indexed)
    nombre: 'string',          // User full name
    passwordHash: 'string',    // Only for email/password users (not for SSO)
    role: 'string',            // 'student' | 'professor' | 'admin'
    lastLoginAt: 'timestamp',  // Last login timestamp
    createdAt: 'timestamp'     // Account creation timestamp
};

/**
 * Collection: refreshTokens
 * Stores JWT refresh tokens for authentication
 */
const RefreshTokenSchema = {
    id: 'string',              // Auto-generated
    userId: 'string',          // Reference to users document
    token: 'string',           // Refresh token string (indexed)
    expiresAt: 'timestamp',    // Expiration timestamp
    deviceInfo: 'string',      // User-Agent header
    ipAddress: 'string',       // IP address
    createdAt: 'timestamp'     // Creation timestamp
};

/**
 * Collection: ssoProviders
 * Links users to external OAuth providers
 */
const SSOProviderSchema = {
    id: 'string',              // Auto-generated
    userId: 'string',          // Reference to users document
    provider: 'string',        // 'google' | 'github' | 'microsoft'
    providerUserId: 'string',  // UID from provider
    email: 'string',           // Email from provider
    createdAt: 'timestamp'     // Link creation timestamp
};

/**
 * Collection: timeSlots
 * Fixed time slots for reservations
 */
const TimeSlotSchema = {
    id: 'string',              // Auto-generated
    startTime: 'string',       // '07:00' format
    endTime: 'string',         // '09:00' format
    label: 'string'            // '7-9' display label
};

/**
 * Collection: auditLogs
 * Tracks all user actions for trazabilidad
 */
const AuditLogSchema = {
    id: 'string',              // Auto-generated
    userId: 'string',          // Reference to users document (indexed)
    action: 'string',          // Action type (e.g., 'LOGIN', 'CREATE_RESERVA')
    entityType: 'string',      // 'reserva' | 'report' | 'user'
    entityId: 'string',        // ID of affected entity
    details: 'object',         // Flexible metadata (before/after values, etc.)
    ipAddress: 'string',       // IP address
    userAgent: 'string',       // User-Agent header
    createdAt: 'timestamp'     // Action timestamp (indexed)
};

/**
 * Collection: notifications
 * In-app notifications for users
 */
const NotificationSchema = {
    id: 'string',              // Auto-generated
    userId: 'string',          // Reference to users document (indexed)
    type: 'string',            // 'NEW_REPORT' | 'REPORT_STATUS_CHANGE' | 'SYSTEM_ALERT'
    title: 'string',           // Notification title
    message: 'string',         // Notification message
    metadata: 'object',        // Additional data (e.g., report ID)
    read: 'boolean',           // Read status (indexed)
    createdAt: 'timestamp'     // Creation timestamp (indexed)
};

/**
 * Required Firestore Indexes
 * Create these in Firebase Console or via firebase.indexes.json
 */
const REQUIRED_INDEXES = [
    {
        collection: 'users',
        fields: [
            { fieldPath: 'email', mode: 'ASCENDING' }
        ]
    },
    {
        collection: 'refreshTokens',
        fields: [
            { fieldPath: 'token', mode: 'ASCENDING' }
        ]
    },
    {
        collection: 'refreshTokens',
        fields: [
            { fieldPath: 'userId', mode: 'ASCENDING' }
        ]
    },
    {
        collection: 'auditLogs',
        fields: [
            { fieldPath: 'userId', mode: 'ASCENDING' },
            { fieldPath: 'createdAt', mode: 'DESCENDING' }
        ]
    },
    {
        collection: 'notifications',
        fields: [
            { fieldPath: 'userId', mode: 'ASCENDING' },
            { fieldPath: 'read', mode: 'ASCENDING' },
            { fieldPath: 'createdAt', mode: 'DESCENDING' }
        ]
    }
];

module.exports = {
    COLLECTIONS,
    UserSchema,
    RefreshTokenSchema,
    SSOProviderSchema,
    TimeSlotSchema,
    AuditLogSchema,
    NotificationSchema,
    REQUIRED_INDEXES
};
