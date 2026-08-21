-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 13_indexes.sql
-- Purpose : Performance Indexes
-- ============================================================

-- Users
CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_role
ON users(role_id);

-- Properties
CREATE INDEX idx_property_code
ON properties(property_code);

CREATE INDEX idx_property_type
ON properties(property_type_id);

CREATE INDEX idx_property_created_by
ON properties(created_by);

-- Addresses
CREATE INDEX idx_address_property
ON addresses(property_id);

CREATE INDEX idx_address_city
ON addresses(city);

-- Ownership
CREATE INDEX idx_owner_property
ON ownership_records(property_id);

CREATE INDEX idx_owner_owner
ON ownership_records(owner_id);

-- Verification
CREATE INDEX idx_tax_property
ON property_taxes(property_id);

CREATE INDEX idx_permit_property
ON permits(property_id);

CREATE INDEX idx_zoning_property
ON zoning_information(property_id);

CREATE INDEX idx_flood_property
ON flood_information(property_id);

CREATE INDEX idx_environment_property
ON environmental_records(property_id);

CREATE INDEX idx_utility_property
ON utility_information(property_id);

-- Risk
CREATE INDEX idx_risk_property
ON risk_assessments(property_id);

CREATE INDEX idx_risk_category
ON risk_assessments(risk_category_id);

-- Reports
CREATE INDEX idx_report_property
ON due_diligence_reports(property_id);

CREATE INDEX idx_document_property
ON property_documents(property_id);

-- Notifications
CREATE INDEX idx_notification_user
ON notifications(user_id);

-- Audit
CREATE INDEX idx_audit_user
ON audit_logs(user_id);

CREATE INDEX idx_login_user
ON login_history(user_id);

-- API
CREATE INDEX idx_api_provider
ON api_logs(api_provider_id);

CREATE INDEX idx_api_property
ON api_logs(property_id);