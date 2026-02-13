-- =====================================================
-- Migration: Firebase/Firestore to Postgres
-- Description: Tables for audit logs, refresh tokens, and notifications
-- =====================================================

-- Table: audit_logs
-- Stores all user actions and system events for auditing purposes
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Table: refresh_tokens
-- Stores refresh tokens for long-lived authentication sessions
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_expires ON refresh_tokens(expires_at);

-- Table: notifications
-- Stores user notifications (optional - if needed)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notification_created ON notifications(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for all user actions and system events';
COMMENT ON TABLE refresh_tokens IS 'Long-lived refresh tokens for maintaining authentication sessions';
COMMENT ON TABLE notifications IS 'User notifications for important system events';

COMMENT ON COLUMN audit_logs.details IS 'Additional context about the action in JSON format';
COMMENT ON COLUMN refresh_tokens.device_info IS 'User agent string from the device that created the token';
COMMENT ON COLUMN notifications.data IS 'Additional notification context in JSON format';

