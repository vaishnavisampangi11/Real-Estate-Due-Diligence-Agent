-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 11_audit_tables.sql
-- Module  : Audit
-- ============================================================

-- ============================================================
-- Table: audit_logs
-- ============================================================

CREATE TABLE audit_logs (

    audit_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT,

    action VARCHAR(100) NOT NULL,

    entity_name VARCHAR(100),

    entity_id BIGINT,

    old_value JSONB,

    new_value JSONB,

    ip_address VARCHAR(50),

    action_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- ============================================================
-- Table: login_history
-- ============================================================

CREATE TABLE login_history (

    login_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    logout_time TIMESTAMP,

    login_status VARCHAR(30),

    ip_address VARCHAR(50),

    device_info VARCHAR(255),

    CONSTRAINT fk_login_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);